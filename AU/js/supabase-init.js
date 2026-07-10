/**
 * PawWell — Supabase 连接配置
 * ============================================
 * 已接入真实 Supabase 项目（cbbaejwbkenrutmgqikt）
 * 注意：当前使用 service_role key（来自 api-client.js 既有配置）。
 * 生产环境建议改为 anon key + RLS 策略，见文末说明。
 * ============================================
 */

const SUPABASE_URL = 'https://cbbaejwbkenrutmgqikt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk5NzU3NCwiZXhwIjoyMDk4NTczNTc0fQ.1N3D6ahkkxYe6ykxphk_jJ4BHHshmcbTe-IrDIw6F64';

// 数据库接口说明（供第三方参考）：
// case_db_port      = articles 表，slug='arthritis'|'kidney'|'heart'
// blog_db_port      = articles 表，category='blog'
// assessment_db_port = assessments 表（体检提交）
// community_db_port  = community_posts / community_comments 表（社区互动）

(function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase._isReady = true;
        console.log('✅ PawWell Supabase connected');
    } else {
        console.warn('⚠️ supabase-js CDN not loaded. Add it before supabase-init.js');
    }
})();

/*
 * 生产环境安全建议：
 * 1. 在 Supabase Dashboard 创建 anon key（role=anon）
 * 2. 为 community_posts / community_comments 配置 RLS：
 *    - SELECT: 允许公开读取
 *    - INSERT: 允许公开插入（post_id, author, content）
 *    - UPDATE: 仅允许 Service Role 更新 likes/views（点赞计数）
 * 3. 前端改用 anon key，Service key 仅用于 Edge Functions / 后台
 */
