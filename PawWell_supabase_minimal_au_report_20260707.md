# PawWell Supabase 极简数据库方案（AU）

## 结论

已准备一份极简 Supabase 建表脚本：

- `D:\temp\web\supabase_au_minimal_schema.sql`

它满足三条约束：

1. Supabase 项目创建时选择澳大利亚区域；所有表保留 `country` 字段，默认值为 `Australia`。
2. 前端和第三方只调用 `app_api` schema 下的 RPC 接口；客户端角色不开放直接表权限。
3. 每张核心表只保留 `id`、`content`、`created_at`、`updated_at`、`country`，业务字段全部放入 `content jsonb`，后续扩展不改表结构。

## 核心表

| 表名 | 用途 | 固定字段 |
| --- | --- | --- |
| `blog_articles` | 博客文章 | `id`, `content`, `created_at`, `updated_at`, `country` |
| `disease_articles` | 病种正文 | `id`, `content`, `created_at`, `updated_at`, `country` |
| `assessment_submissions` | 体检/评估提交 | `id`, `content`, `created_at`, `updated_at`, `country` |
| `community_posts` | 社区帖子 | `id`, `content`, `created_at`, `updated_at`, `country` |
| `community_comments` | 社区评论 | `id`, `content`, `created_at`, `updated_at`, `country` |
| `interface_events` | 接口事件/扩展预留 | `id`, `content`, `created_at`, `updated_at`, `country` |

## 指定接口

第三方只对接以下 Supabase RPC：

| 接口 | 对应用途 |
| --- | --- |
| `app_api.get_blog_articles(p_category, p_country)` | 对应 `getBlogArticles(category)` |
| `app_api.get_disease_article(p_slug, p_country)` | 对应 `getDiseaseArticle(slug)` |
| `app_api.submit_assessment(p_payload, p_country)` | 对应 `assessment.submit(payload)` |
| `app_api.get_community_posts(p_country)` | 社区读取 |
| `app_api.create_community_post(p_payload, p_country)` | 社区发帖 |
| `app_api.create_community_comment(p_payload, p_country)` | 社区评论 |
| `app_api.record_interface_event(p_payload, p_country)` | 预留接口事件 |

## 国家扩展规则

当前默认国家：

```text
Australia
```

未来增加国家时，只允许新增 `country` 字段值，例如：

```text
New Zealand
United States
Canada
```

不要新增国家专用表，不要新增国家专用字段，也不要把 `country` 做成数据库 enum。

## 安全边界

脚本会执行：

- `enable row level security`
- `revoke all on table ... from anon, authenticated`
- 只给 `anon` 和 `authenticated` 授权执行 `app_api` RPC

因此客户端不能直接 `select/insert/update/delete` 表，只能通过指定接口读取或写入。

## 第三方执行步骤

1. 在 Supabase 新建项目时选择澳大利亚区域。
2. 在 SQL Editor 执行 `supabase_au_minimal_schema.sql`。
3. 在 Supabase API 设置里暴露 `app_api` schema；客户端只调用这个 schema 下的 RPC。
4. 在 `supabase-init.js` 填入项目 URL 和 anon key。
5. 将现有 mock 替换为 `supabase.schema('app_api').rpc(...)` 调用，保持页面显示逻辑不动。
6. 接口清单最终确认后，只新增或调整 `app_api` RPC，不改前端页面结构。

## 示例调用

```js
const { data, error } = await supabase.schema('app_api').rpc('get_blog_articles', {
  p_category: 'arthritis',
  p_country: 'Australia'
});
```

```js
const { data, error } = await supabase.schema('app_api').rpc('submit_assessment', {
  p_payload: payload,
  p_country: payload.country || 'Australia'
});
```

## 当前项目核对

我在 `D:\temp\pet-five` 看到的现有 SQL 并不是这套极简方案：它包含多张细分业务表，且部分表没有统一 `country` 字段；现有 RLS 也有匿名写改删策略。若要严格满足本需求，建议使用本报告配套 SQL 作为第三方数据库合同。
