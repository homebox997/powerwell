/**
 * PawWell — Supabase 连接配置
 * ============================================
 * 第三步：填写下面两个值，然后删除这些注释
 * ============================================
 */

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';   // ← 替换这里
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                // ← 替换这里

// 数据库接口说明（供第三方参考）：
// case_db_port      = articles 表，slug='arthritis'|'kidney'|'heart'
// blog_db_port      = articles 表，category='blog'
// assessment_db_port = assessments 表（体检提交）

(function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase._isReady = true;
        console.log('\u2705 PawWell Supabase connected');
    } else {
        console.warn('\u26a0\ufe0f supabase-js CDN not loaded. Add it before supabase-init.js');
    }
})();
