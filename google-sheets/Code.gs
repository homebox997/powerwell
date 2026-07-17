/**
 * PawWell — Google Sheets 后端（Web App）
 * ============================================================
 * 部署方式：Google Apps Script 编辑器 → 新建脚本 → 粘贴本文件 →
 *   部署 → 新建部署 → 选择"Web 应用" →
 *   执行身份：我(自己) / 访问者：任何人(匿名) → 部署后得到 URL
 * 前端把该 URL 填进 js/gs-api-client.js 的 SCRIPT_URL 即可。
 *
 * 所有请求走 doPost，body 为 JSON：{ "action": "...", ... }
 * 返回 JSON：{ "ok": true, "data": [...] }
 */

const SS_ID = 'REPLACE_WITH_YOUR_SPREADSHEET_ID'; // ← 你的 Google Sheet 文件 ID
const SHEET = {
  assessments:   'assessments',
  posts:         'community_posts',
  comments:      'community_comments',
  leads:         'leads',
  blog:          'blog_articles'
};

function openSS() {
  return SpreadsheetApp.openById(SS_ID);
}
function getSheet(name) {
  const ss = openSS();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}
function ensureHeader(name, header) {
  const sh = getSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(header);
}
function newId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    if (action === 'add_assessment') {
      ensureHeader(SHEET.assessments, ['id','breed','gender','nickname','symptoms','symptom_count','detected_areas','email','country','created_at']);
      const id = newId('a');
      getSheet(SHEET.assessments).appendRow([
        id, body.breed, body.gender, body.nickname,
        (body.symptoms||[]).join(' | '), body.symptom_count||0,
        (body.detected_areas||[]).join(' | '), body.email||'', body.country||'AU',
        new Date().toISOString()
      ]);
      result = { id: id };

    } else if (action === 'list_posts') {
      result = readRows(SHEET.posts);

    } else if (action === 'create_post') {
      ensureHeader(SHEET.posts, ['id','user_id','author_name','dog_name','breed','content','tags','likes','comments','views','is_approved','created_at']);
      const id = newId('p');
      getSheet(SHEET.posts).appendRow([
        id, body.user_id||'u_anon', body.author_name||'匿名', body.dog_name||'',
        body.breed||'', body.content, (body.tags||[]).join(' | '), 0, 0, 0, 'FALSE',
        new Date().toISOString()
      ]);
      result = { id: id };

    } else if (action === 'list_comments') {
      const all = readRows(SHEET.comments);
      result = all.filter(c => c.post_id === body.post_id);

    } else if (action === 'add_comment') {
      ensureHeader(SHEET.comments, ['id','post_id','author_name','content','is_approved','created_at']);
      const id = newId('c');
      getSheet(SHEET.comments).appendRow([
        id, body.post_id, body.author_name||'匿名', body.content, 'FALSE', new Date().toISOString()
      ]);
      result = { id: id };

    } else if (action === 'like_post') {
      const sh = getSheet(SHEET.posts);
      const rows = sh.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === body.post_id) {
          rows[i][7] = (Number(rows[i][7]) || 0) + 1; // likes 列
          sh.getRange(i + 1, 8).setValue(rows[i][7]);
          result = { likes: rows[i][7] };
          break;
        }
      }
      if (!result) result = { likes: 0 };

    } else if (action === 'add_lead') {
      ensureHeader(SHEET.leads, ['id','name','email','content_type','message','created_at']);
      const id = newId('l');
      getSheet(SHEET.leads).appendRow([
        id, body.name||'', body.email||'', body.content_type||'', body.message||'', new Date().toISOString()
      ]);
      result = { id: id };

    } else {
      return json({ ok: false, error: 'unknown action: ' + action });
    }

    return json({ ok: true, data: result });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function readRows(name) {
  const sh = getSheet(name);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  const header = rows[0];
  return rows.slice(1).map(r => {
    const o = {};
    header.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 健康检查（浏览器直接访问 Web App URL 会走 doGet）
function doGet() {
  return json({ ok: true, msg: 'PawWell Sheets backend alive' });
}
