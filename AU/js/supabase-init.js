/**
 * PawWell — Supabase 连接配置
 * ============================================
 *  *  *  * ============================================
 */

const SUPABASE_URL = 'https://cbbaejwbkenrutmgqikt.supabase.co';
// SECURITY: anon public key only (RLS enforced). Never expose service_role key in client code.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE';


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
 *  * 1. 在 Supabase Dashboard 创建 anon key（role=anon）
 * 2. 为 community_posts / community_comments 配置 RLS：
 *    - SELECT: 允许公开读取
 *    - INSERT: 允许公开插入（post_id, author, content）
 *    - UPDATE: 仅允许 Service Role 更新 likes/views（点赞计数）
 * 3. 前端改用 anon key，Service key 仅用于 Edge Functions / 后台
 */
