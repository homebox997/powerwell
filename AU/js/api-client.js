/**
 * PawWell — 前端 API 客户端（前后端严格解耦）
 * ============================================================
 * 本文件定义所有数据接口的【前端调用代码】。
 * 前端只通过标准 REST 接口与后端通信，不直接依赖 Supabase 或任何后端实现。
 * 后端（Supabase 开发智能体）需实现下列接口路径，并返回约定 JSON 结构。
 *
 * 【部署配置】baseURL 由部署时设置，例如：
 *   - 自有后端：  '/api'
 *   - Supabase Edge Functions：'/functions/v1'
 *   - 或完整域名：'https://your-project.supabase.co/functions/v1'
 *
 * 【多地区】country 参数区分 AU / US / UK，后端按 country 过滤数据。
 *
 * 本文件为"预埋接口"，不改动任何页面展示层。第三方将各页面的 mock 渲染
 * 替换为调用本文件对应方法即可（渲染节点见各方法注释）。
 */

const PawWellAPI = {
  // ===== Supabase 直连配置（service role key 绕过 RLS）=====
  supabaseUrl: 'https://cbbaejwbkenrutmgqikt.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk5NzU3NCwiZXhwIjoyMDk4NTczNTc0fQ.1N3D6ahkkxYe6ykxphk_jJ4BHHshmcbTe-IrDIw6F64',
  baseURL: 'https://cbbaejwbkenrutmgqikt.supabase.co/rest/v1',                 // ← 部署时由后端配置
  country: 'AU',                   // 页面可按地区覆盖（如 PawWellAPI.country = 'US'）

  // ===================== 博客模块 =====================
  blog: {
    /**
     * 文章列表
     * 接口路径: GET {baseURL}/articles
     * 请求方式: GET
     * 入参(query): category(all|health-case|tip|qa|review), country
     * 返回JSON: [
     *   { "id":"blog1", "slug":"arthritis-18-months", "title":"...", "excerpt":"...",
     *     "cover_image":"https://...", "category":"health-case", "tags":["Arthritis"], "created_at":"2026-..." }
     * ]
     * 前端渲染节点: #blogGrid (blog.html) — 渲染函数 renderGrid(category, list)
     */
    async list(category = 'all', country = PawWellAPI.country) {
      const url = `${PawWellAPI.supabaseUrl}/rest/v1/blog_articles?category=eq.${encodeURIComponent(category)}&country=eq.${country}&select=id,title,slug,excerpt,cover_image,category,tags,created_at&order=created_at.desc&limit=20`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('blog.list failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 文章详情
     * 接口路径: GET {baseURL}/articles/:slug
     * 请求方式: GET
     * 入参(path): slug；query: country
     * 返回JSON: {
     *   "id":"blog1", "slug":"arthritis-18-months", "title":"...", "subtitle":"...",
     *   "body":"<p>...</p>", "excerpt":"...", "cover_image":"...", "category":"health-case",
     *   "tags":["Arthritis"], "created_at":"2026-...", "author":"..."
     * }
     * 前端渲染节点: 文章详情页容器（未来扩展）
     */
    async detail(slug, country = PawWellAPI.country) {
      const url = `${PawWellAPI.baseURL}/articles/${encodeURIComponent(slug)}?country=${country}`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('blog.detail failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    }
  },

  // ===================== 专题模块（三大病种）=====================
  topic: {
    /**
     * 病种专题内容加载
     * 接口路径: GET {baseURL}/topics/:slug
     * 请求方式: GET
     * 入参(path): slug(arthritis|kidney|heart)；query: country
     * 返回JSON: {
     *   "slug":"arthritis", "title":"...", "subtitle":"...", "hero_image":"...",
     *   "body_sections":[{ "heading":"...", "html":"<p>...</p>" }],
     *   "key_takeaway":"...", "toc":["...","..."],
     *   "related_articles":[{ "slug":"...", "title":"..." }],
     *   "schema_json":"{...}"
     * }
     * 前端渲染节点: 病种页正文容器（arthritis.html / kidney.html / heart.html 的 <article> 内）
     */
    async get(slug, country = PawWellAPI.country) {
      const url = `${PawWellAPI.baseURL}/topics/${encodeURIComponent(slug)}?country=${country}`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('topic.get failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    }
  },

  // ===================== 社区模块 =====================
  community: {
    /**
     * 帖子列表
     * 接口路径: GET {baseURL}/community/posts
     * 请求方式: GET
     * 入参(query): category(all|...), page, country
     * 返回JSON: [
     *   { "id":"p1", "user_id":"u1", "author_name":"...", "dog_name":"...", "breed":"...",
     *     "content":"...", "tags":["Arthritis"], "likes":47, "comments":12, "views":312,
     *     "created_at":"2 hours ago", "images":["https://..."] }
     * ]
     * 前端渲染节点: #postFeed (community.html) — 渲染函数 renderPostCard(post)
     */
    async listPosts(category = 'all', page = 1, country = PawWellAPI.country) {
      const url = `${PawWellAPI.baseURL}/community/posts?category=${encodeURIComponent(category)}&page=${page}&country=${country}`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('community.listPosts failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 帖子详情 + 评论
     * 接口路径: GET {baseURL}/community/posts/:id
     * 请求方式: GET
     * 入参(path): id；query: country
     * 返回JSON: {
     *   "post":{ ...帖子对象... },
     *   "comments":[ { "id":"c1", "post_id":"p1", "author_name":"...", "content":"...", "created_at":"..." } ]
     * }
     * 前端渲染节点: #detailContent (community.html)
     */
    async getPost(postId, country = PawWellAPI.country) {
      const url = `${PawWellAPI.baseURL}/community/posts/${encodeURIComponent(postId)}?country=${country}`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('community.getPost failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 发帖
     * 接口路径: POST {baseURL}/community/posts
     * 请求方式: POST
     * 入参(body): { "user_id":"u1", "dog_name":"...", "breed":"...", "content":"...", "tags":["..."], "images":["..."] }
     * 返回JSON: { "id":"p_new", ...新建帖子对象 }
     * 前端触发: community.html 发帖表单提交 → createPost()
     */
    async createPost(payload) {
      const res = await fetch(`${PawWellAPI.baseURL}/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, country: PawWellAPI.country })
      });
      if (!res.ok) throw new Error('community.createPost failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 提交评论
     * 接口路径: POST {baseURL}/community/posts/:id/comments
     * 请求方式: POST
     * 入参(body): { "post_id":"p1", "author_name":"...", "content":"..." }
     * 返回JSON: { "id":"c_new", ...新建评论对象 }
     * 前端渲染节点: #detailContent 内评论区
     */
    async addComment(postId, content) {
      const res = await fetch(`${PawWellAPI.baseURL}/community/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content, country: PawWellAPI.country })
      });
      if (!res.ok) throw new Error('community.addComment failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 点赞
     * 接口路径: POST {baseURL}/community/posts/:id/like
     * 请求方式: POST
     * 入参(body): { "post_id":"p1" }
     * 返回JSON: { "likes": 48 }
     * 前端渲染节点: .like-btn (community.html)
     */
    async like(postId) {
      const res = await fetch(`${PawWellAPI.baseURL}/community/posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, country: PawWellAPI.country })
      });
      if (!res.ok) throw new Error('community.like failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    }
  },

  // ===================== 自测模块（AI 健康体检）=====================
  assessment: {
    /**
     * 提交体检结果
     * 接口路径: POST {baseURL}/assessments
     * 请求方式: POST
     * 入参(body): {
     *   "breed":"...", "gender":"...", "nickname":"...",
     *   "symptoms":["Limping","..."], "symptom_count":3,
     *   "email":"user@example.com"(可空), "country":"AU"
     * }
     * 返回JSON: { "id":"a_new", "created_at":"2026-..." }
     * 前端触发: assessment.html submitForm()
     * 注意: 结果已在本地计算回显（reportDog / reportCount / reportTags / reportSummary / reportRec），
     *       此提交为静默同步，失败不阻塞前端展示。
     */
    async submit(payload) {
      const res = await fetch(`${PawWellAPI.baseURL}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, country: PawWellAPI.country })
      });
      if (!res.ok) throw new Error('assessment.submit failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    },

    /**
     * 获取历史体检报告（结果回显数据，可选）
     * 接口路径: GET {baseURL}/assessments/:id
     * 请求方式: GET
     * 入参(path): id；query: country
     * 返回JSON: {
     *   "breed":"...", "gender":"...", "nickname":"...", "symptoms":["..."],
     *   "detected_areas":["Joint & Mobility"], "summary":"...", "recommendations":"..."
     * }
     * 前端渲染节点: assessment.html 结果区（reportDog / reportCount / reportTags / reportSummary / reportRec）
     */
    async get(id, country = PawWellAPI.country) {
      const url = `${PawWellAPI.baseURL}/assessments/${encodeURIComponent(id)}?country=${country}`;
      const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': PawWellAPI.serviceKey,
        'Authorization': `Bearer ${PawWellAPI.serviceKey}`,
        'Accept': 'application/json'
      }
    });
      if (!res.ok) throw new Error('assessment.get failed: ' + res.status);
      const data = await res.json();
      // Supabase 返回数组直接使用
      if (Array.isArray(data)) return data;
      // 兼容对象格式
      return data.data || [];
    }
  }
};

window.PawWellAPI = PawWellAPI;
