import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const NOTION_VERSION = '2026-03-11';
const NOTION_BASE = 'https://api.notion.com/v1';

type NotionRichText = {
  plain_text?: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
  };
  href?: string | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

async function notionRequest(path: string, init: RequestInit = {}) {
  const notionKey = env('NOTION_API_KEY');
  const res = await fetch(`${NOTION_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${notionKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.message || `Notion request failed: ${res.status}`;
    throw new Error(message);
  }
  return body;
}

function richTextToHtml(items: NotionRichText[] = []) {
  return items.map((item) => {
    let text = (item.plain_text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (item.annotations?.italic) text = `<i>${text}</i>`;
    if (item.annotations?.bold) text = `<b>${text}</b>`;
    if (item.href) text = `<a href="${item.href}" target="_blank" rel="noopener">${text}</a>`;
    return text;
  }).join('');
}

function getTitle(properties: Record<string, any>) {
  const prop = properties['标题'] || properties.Title || properties.Name;
  return richTextToHtml(prop?.title || prop?.rich_text || []);
}

function getTags(properties: Record<string, any>) {
  const prop = properties['标签'] || properties.Tags;
  if (prop?.multi_select) return prop.multi_select.map((item: any) => item.name);
  if (prop?.select?.name) return [prop.select.name];
  return [];
}

function getSyncStatus(properties: Record<string, any>) {
  const prop = properties['同步状态'] || properties.Status || properties.Sync;
  return prop?.select?.name || prop?.status?.name || '';
}

async function listBlockChildren(blockId: string) {
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const query = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100';
    const page = await notionRequest(`/blocks/${blockId}/children${query}`);
    results.push(...(page.results || []));
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  return results;
}

function blocksToHtml(blocks: any[]) {
  return blocks.map((block) => {
    const type = block.type;
    const data = block[type] || {};
    if (type === 'paragraph') return `<p>${richTextToHtml(data.rich_text)}</p>`;
    if (type === 'heading_1') return `<h1>${richTextToHtml(data.rich_text)}</h1>`;
    if (type === 'heading_2') return `<h2>${richTextToHtml(data.rich_text)}</h2>`;
    if (type === 'heading_3') return `<h3>${richTextToHtml(data.rich_text)}</h3>`;
    if (type === 'bulleted_list_item') return `<ul><li>${richTextToHtml(data.rich_text)}</li></ul>`;
    if (type === 'numbered_list_item') return `<ol><li>${richTextToHtml(data.rich_text)}</li></ol>`;
    if (type === 'quote') return `<blockquote>${richTextToHtml(data.rich_text)}</blockquote>`;
    if (type === 'image') {
      const url = data.file?.url || data.external?.url || '';
      return url ? `<img src="${url}" alt="">` : '';
    }
    if (type === 'file' || type === 'pdf') {
      const url = data.file?.url || data.external?.url || '';
      return url ? `<a class="download-button" href="${url}" target="_blank" rel="noopener">点击下载</a>` : '';
    }
    if (type === 'table') return '<table><tbody><!-- table rows are fetched as child blocks by future expansion --></tbody></table>';
    if (type === 'child_page') return `<a href="${block.id}" target="_blank" rel="noopener">${data.title || '子页面'}</a>`;
    return '';
  }).join('\n');
}

async function queryPendingNotionItems(dataSourceId: string) {
  const body = {
    page_size: 100,
    filter: {
      property: '同步状态',
      select: {
        equals: '待同步'
      }
    }
  };
  return notionRequest(`/data_sources/${dataSourceId}/query`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function markNotionPageSynced(pageId: string) {
  await notionRequest(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        '同步状态': {
          select: { name: '已同步' }
        }
      }
    })
  });
}

async function addNotionComment(pageId: string, message: string) {
  await notionRequest('/comments', {
    method: 'POST',
    body: JSON.stringify({
      parent: { page_id: pageId },
      rich_text: [{ text: { content: message } }]
    })
  });
}

async function syncFromNotion(triggerType: string) {
  const { data: connection, error: connectionError } = await supabase
    .from('notion_connections')
    .select('*')
    .eq('status', 'active')
    .order('configured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (connectionError) throw connectionError;
  if (!connection) throw new Error('No active Notion connection configured.');

  const { data: job } = await supabase
    .from('notion_sync_jobs')
    .insert({ trigger_type: triggerType, status: 'running', started_at: new Date().toISOString() })
    .select()
    .single();

  try {
    const notionRows = await queryPendingNotionItems(connection.data_source_id);
    let count = 0;

    for (const page of notionRows.results || []) {
      const status = getSyncStatus(page.properties || {});
      if (status !== '待同步') continue;

      const blocks = await listBlockChildren(page.id);
      const body = blocksToHtml(blocks);
      const title = getTitle(page.properties || {});
      const tags = getTags(page.properties || {});
      const normalized = {
        content_title: title,
        content_body: body,
        content_tag: tags,
        source: 'notion',
        notion_page_id: page.id,
        notion_url: page.url
      };

      const { error } = await supabase
        .from('notion_review_pool')
        .upsert({
          notion_page_id: page.id,
          notion_url: page.url,
          content_title: title,
          content_body: body,
          content_tag: tags,
          normalized_content: normalized,
          status: 'pending_review'
        }, { onConflict: 'notion_page_id' });

      if (error) throw error;
      count += 1;
    }

    await supabase
      .from('notion_sync_jobs')
      .update({ status: 'completed', finished_at: new Date().toISOString(), message: `${count} items loaded into review pool.` })
      .eq('id', job?.id);

    return { ok: true, count };
  } catch (err) {
    await supabase.from('system_events').insert({
      severity: String(err.message || '').toLowerCase().includes('unauthorized') ? 'critical' : 'error',
      source: 'notion-sync',
      message: err.message,
      payload: { job_id: job?.id }
    });
    await supabase
      .from('notion_sync_jobs')
      .update({ status: 'failed', finished_at: new Date().toISOString(), message: err.message })
      .eq('id', job?.id);
    throw err;
  }
}

async function flushNotionReviewCallbacks() {
  const { data: rows, error } = await supabase
    .from('notion_review_pool')
    .select('*')
    .in('status', ['approved', 'notion_comment_pending']);

  if (error) throw error;

  for (const row of rows || []) {
    if (row.status === 'approved') {
      await markNotionPageSynced(row.notion_page_id);
      await supabase.from('notion_review_pool').update({ status: 'synced' }).eq('id', row.id);
    }
    if (row.status === 'notion_comment_pending') {
      await addNotionComment(row.notion_page_id, `需修改：${row.rejection_reason || '请根据后台审核意见调整内容'}`);
      await supabase.from('notion_review_pool').update({ status: 'rejected' }).eq('id', row.id);
    }
  }

  return { ok: true, count: rows?.length || 0 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const action = payload.action || 'sync';
    const result = action === 'flush_callbacks'
      ? await flushNotionReviewCallbacks()
      : await syncFromNotion(payload.trigger_type || 'manual');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

