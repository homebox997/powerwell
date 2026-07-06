/**
 * PawWell — 数据库接口层（Database API Contract）
 * ============================================================
 * 本文件是第三方开发者对接数据库的【单一合同入口】。
 * 所有"需要读写数据库"的模块，其数据接口都集中定义在此。
 * 第三方开发者只需把每个函数体内的 TODO 替换为真实 Supabase 调用即可，
 * 无需理解任何页面渲染逻辑。
 *
 * 前置依赖：
 *   - supabase-init.js 已创建 window.sb（Supabase client）
 *   - 在 supabase-init.js 填入 SUPABASE_URL / SUPABASE_ANON_KEY
 *
 * 多地区约定：
 *   - 所有读取/写入都带 country 参数（默认 'AU'，/US/ /UK/ 时由页面覆盖）
 *   - 数据库每张表均有 country 字段（详见《PawWell数据库设计报告》）
 *
 * 表清单（详见报告）：
 *   articles            — 内容库：病种指南(content_type='disease_guide') + 博客(content_type='blog_post')
 *   assessments         — 体检提交记录
 *   leads               — 潜在客户邮箱（从体检/订阅同步）
 *   community_users     — 社区用户
 *   community_posts     — 社区帖子
 *   community_comments  — 社区评论
 */

const PawWellDB = {
  // 当前地区，可由各页面在加载时覆盖（如 /US/ 页面设为 'US'）
  country: 'AU',

  // ===================== 博客 / 病种文章（articles 表）=====================
  articles: {
    /**
     * 获取博客文章列表（blog.html 调用）
     * @param {string} category - 筛选：'all' | 'health-case' | 'tip' | 'qa' | 'review'
     * @param {string} [country]
     * @returns {Promise<Array>} 文章对象数组
     *   字段：{id, slug, title, excerpt, cover_image, category, tags, created_at, ...}
     * 数据库接口：
     *   SELECT * FROM articles
     *   WHERE content_type='blog_post' AND country=? AND is_published=true
     *   ORDER BY created_at DESC
     */
    async getBlogArticles(category = 'all', country = PawWellDB.country) {
      // TODO(第三方): 替换为 Supabase 真实查询
      // const { data, error } = await window.sb.from('articles')
      //   .select('*')
      //   .eq('content_type', 'blog_post')
      //   .eq('country', country)
      //   .eq('is_published', true)
      //   .order('created_at', { ascending: false });
      // if (category !== 'all') data = data.filter(a => a.category === category);
      // return data || [];
      return []; // 占位：blog.html 当前用本地 ARTICLES mock，未来替换为上方查询
    },

    /**
     * 获取病种指南正文（arthritis/kidney/heart.html 调用）
     * @param {string} slug - 'arthritis' | 'kidney' | 'heart'
     * @param {string} [country]
     * @returns {Promise<Object|null>} 文章对象
     *   字段：{title, subtitle, body, excerpt, cover_image, seo_title, seo_description, schema_json, ...}
     * 数据库接口：
     *   SELECT * FROM articles
     *   WHERE slug=? AND country=? AND content_type='disease_guide'
     *   LIMIT 1
     */
    async getDiseaseArticle(slug, country = PawWellDB.country) {
      // TODO(第三方): 替换为 Supabase 真实查询
      // const { data, error } = await window.sb.from('articles')
      //   .select('*')
      //   .eq('slug', slug)
      //   .eq('country', country)
      //   .eq('content_type', 'disease_guide')
      //   .single();
      // return data;
      return null; // 占位：病种页当前为静态 HTML，未来用返回的 body 替换静态正文
    }
  },

  // ===================== 体检（assessments 表）=====================
  assessment: {
    /**
     * 提交体检结果（assessment.html submitForm 调用）
     * @param {Object} payload
     *   {breed, gender, nickname, symptoms:string[], symptom_count:int, email, country}
     * @returns {Promise<void>}
     * 数据库接口：
     *   INSERT INTO assessments (breed, gender, nickname, symptoms, symptom_count, email, country) VALUES (...)
     *   同步 INSERT/UPSERT leads (email, source='assessment', country)
     */
    async submit(payload) {
      if (typeof window.sb === 'undefined') {
        console.warn('[PawWellDB] Supabase not ready, skip assessment submit');
        return;
      }
      // TODO(第三方): 确认表名/字段与建表 SQL 一致
      const { error } = await window.sb.from('assessments').insert([{
        breed: payload.breed,
        gender: payload.gender,
        nickname: payload.nickname,
        symptoms: payload.symptoms,
        symptom_count: payload.symptom_count,
        email: payload.email || null,
        country: payload.country || PawWellDB.country
      }]);
      if (error) console.error('[PawWellDB] assessment insert failed', error);
      if (payload.email) {
        await window.sb.from('leads').upsert(
          [{ email: payload.email, source: 'assessment', country: payload.country || PawWellDB.country }],
          { onConflict: 'email' }
        );
      }
    }
  }

  // ===================== 社区（community_* 表）=====================
  // 社区接口已封装在 community-data.js 的 CommunityDB 对象中
  // （getPosts / getPost / getComments / createPost / addComment / likePost），
  // 第三方替换其内部 mock 即可。此处不再重复定义，避免冲突。
};

window.PawWellDB = PawWellDB;
