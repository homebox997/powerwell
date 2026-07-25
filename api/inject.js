// Vercel Edge Function: Inject dynamic article stats & comments
// Triggered by rewrite: /AU/<name>.html -> /api/inject?slug=<name>
// Fetches source HTML from /AU/src/<name>.html (static, no rewrite loop)
// Replaces placeholders with live Supabase data

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://cbbaejwbkenrutmgqikt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    console.error('Fetch error:', res.status, text.slice(0, 200));
    return null;
  }
  return res.json();
}

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || 'index';

  // 1. Fetch source HTML from /AU/src/<slug>.html (internal, not rewritten)
  const srcUrl = new URL(`/AU/src/${slug}.html`, request.url);
  let htmlRes = await fetch(srcUrl, { method: 'GET' });
  if (!htmlRes.ok) {
    // Fallback: try original path (for non-article pages that may not have been copied)
    htmlRes = await fetch(new URL(`/AU/${slug}.html`, request.url));
  }
  if (!htmlRes.ok) {
    return new Response('Not found', { status: 404 });
  }
  let html = await htmlRes.text();

  // 2. Check if this page has dynamic markers (optimization: skip if no markers)
  if (!html.includes('data-dynamic=') && !html.includes('__VIEW_COUNT__')) {
    // No dynamic markers, return as-is
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 3. Get client IP for view counting
  const clientIP = request.headers.get('cf-connecting-ip') ||
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // 4. Call RPCs concurrently
  const [viewCount, comments] = await Promise.all([
    // Increment view count (24h dedup)
    fetchJSON(`${SUPABASE_URL}/rest/v1/rpc/inc_view_count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_slug: slug, p_ip: clientIP }),
    }),
    // Get approved comments
    fetchJSON(`${SUPABASE_URL}/rest/v1/rpc/get_article_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_slug: slug }),
    }),
  ]);

  const views = viewCount || 0;
  const commentList = Array.isArray(comments) ? comments : [];
  const commentCount = commentList.length;
  // Likes: currently not tracked; show 0 or a default
  const likes = 0;

  // 5. Replace placeholders in HTML
  // A. Replace __VIEW_COUNT__, __COMMENT_COUNT__, __LIKE_COUNT__ in JSON-LD
  html = html.replace(/__VIEW_COUNT__/g, String(views));
  html = html.replace(/__COMMENT_COUNT__/g, String(commentCount));
  html = html.replace(/__LIKE_COUNT__/g, String(likes));

  // B. Replace data-dynamic spans with actual values
  // We'll inject the values via a small inline script that updates the DOM
  // (Simpler than parsing HTML; edge-friendly)
  const injectScript = `
<script data-edge-inject="true">
(function(){
  const d={view:${views},comment:${commentCount},like:${likes}};
  document.querySelectorAll('[data-dynamic="view-count"]').forEach(e=>e.textContent=d.view);
  document.querySelectorAll('[data-dynamic="comment-count"]').forEach(e=>e.textContent=d.comment);
  document.querySelectorAll('[data-dynamic="like-count"]').forEach(e=>e.textContent=d.like);
  const list=document.getElementById('comment-list');
  if(list && ${commentCount}>0){
    const comments=${JSON.stringify(commentList)};
    comments.forEach(c=>{
      const div=document.createElement('div');
      div.className='comment-item';
      div.innerHTML='<div class="comment-header"><span class="comment-author">'+(c.author||'Anonymous')+'</span><time class="comment-time">'+(c.created_at||'').slice(0,10)+'</time></div><p class="comment-text">'+(c.content||'').replace(/</g,'&lt;')+'</p>';
      list.appendChild(div);
    });
  }
})();
</script>
`;
  // Insert before </head>
  html = html.replace(/<\/head>/i, injectScript + '</head>');

  // 6. Return injected HTML
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60', // Edge cache 60s, revalidate
    }
  });
}
