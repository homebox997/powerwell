/**
 * PawWell — Google Sheets 前端适配器（替代 api-client.js）
 * ============================================================
 * 所有数据读写改走 Google Apps Script Web App（Code.gs 部署后的 URL）。
 * 接口签名与 api-client.js 保持一致，方便页面平滑切换。
 *
 * 使用方法：
 *   1. 在下面填入你的 Web App 部署 URL
 *   2. 页面把 <script src="js/api-client.js"> 换成 <script src="js/gs-api-client.js">
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';

const PawWellGS = {
  country: 'AU',

  _post(action, payload) {
    return fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action: action }, payload, { country: PawWellGS.country }))
    }).then(r => r.json());
  },

  // ===== 博客 =====
  blog: {
    async list() { return []; },           // 博客仍走静态生成，无需 Sheet
    async detail() { return null; }
  },

  // ===== 专题 =====
  topic: { async get() { return null; } },

  // ===== 社区 =====
  community: {
    async listPosts() {
      const r = await PawWellGS._post('list_posts', {});
      return r.ok ? r.data : [];
    },
    async getPost(postId) {
      const r = await PawWellGS._post('list_posts', {});
      const post = (r.ok ? r.data : []).find(p => p.id === postId) || null;
      const c = await PawWellGS._post('list_comments', { post_id: postId });
      return { post: post, comments: c.ok ? c.data : [] };
    },
    async createPost(payload) {
      const r = await PawWellGS._post('create_post', payload);
      return r.ok ? r.data : null;
    },
    async addComment(postId, content) {
      const r = await PawWellGS._post('add_comment', { post_id: postId, content: content });
      return r.ok ? r.data : null;
    },
    async like(postId) {
      const r = await PawWellGS._post('like_post', { post_id: postId });
      return r.ok ? r.data : { likes: 0 };
    }
  },

  // ===== AI 健康自测 =====
  assessment: {
    async submit(payload) {
      const r = await PawWellGS._post('add_assessment', payload);
      return r.ok ? r.data : null;
    },
    async get() { return null; }
  },

  // ===== 投稿/询盘 =====
  async addLead(payload) {
    const r = await PawWellGS._post('add_lead', payload);
    return r.ok ? r.data : null;
  }
};

window.PawWellAPI = PawWellGS; // 兼容现有页面调用 PawWellAPI.xxx
