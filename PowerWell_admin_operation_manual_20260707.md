# PowerWell 后台操作手册

## 1. 后台链接

本地后台入口：

```text
D:\temp\powerwell\admin\index.html
```

部署后入口建议：

```text
https://你的域名/admin/
```

## 2. 首次部署

按顺序执行：

1. 在 Supabase SQL Editor 执行 `supabase_au_minimal_schema.sql`。
2. 执行 `supabase_permission_notion_extension.sql`。
3. 创建创始人超级管理员：

```sql
insert into public.admin_users (
  name,
  email,
  role,
  permission_scopes,
  country,
  activated_at,
  is_active
)
values (
  'Founder',
  'founder@example.com',
  'super_admin',
  array['*'],
  'Australia',
  now(),
  true
);
```

4. 在 Supabase Authentication 创建同邮箱账号。
5. 在 Supabase API 设置里暴露 `app_api` schema。
6. 在 `admin/config.js` 填入 Supabase URL 和 anon key。
7. 部署 `supabase/functions/notion-sync`，并配置服务端 secrets。

## 3. 登录后台

1. 打开 `admin/index.html`。
2. 输入 Supabase 邮箱和密码。
3. 点击 `Sign In`。
4. 登录成功后可以读取对应权限范围内的数据。

## 4. 邀请员工

管理员 Amy 或超级管理员操作：

1. 找到 `Employee Invitations`。
2. 输入员工姓名。
3. 输入员工邮箱。
4. 选择权限：
   - `View data only`
   - `Can participate in review`
   - `Can edit non-core fields`
5. 选择权限范围。
6. 点击 `Create Invitation`。
7. 系统生成激活 token。生产环境应由邮件服务发送激活链接。

员工激活后才能登录。未邀请用户无法登录。

## 5. 权限变更

1. 找到 `Permission Changes`。
2. 输入员工邮箱。
3. 选择目标角色。
4. 填写变更原因。
5. 点击 `Submit Permission Request`。

规则：

- 普通员工权限调整可由管理员或超级管理员审批。
- 升级为管理员必须超级管理员审批。
- 所有审批记录都会进入操作日志。

## 6. 配置 Notion

仅超级管理员操作：

1. 在 Notion 创建数据源数据库。
2. 建议字段：
   - `标题`
   - `正文`
   - `标签`
   - `同步状态`
3. 创建 Notion 集成，并授予读取、编辑、评论权限。
4. 将数据源数据库分享给该集成。
5. 在后台 `Notion Connection` 填写：
   - Workspace name
   - Data source ID
   - 服务端密钥引用或加密后的 API key
6. 点击 `Bind Notion`。

重要：真实 Notion API key 不要写入 `admin/config.js` 或任何前端文件。

## 7. 同步 Notion 内容

自动同步：

- 每天 08:00 Australia/Sydney
- 每天 20:00 Australia/Sydney

手动同步：

1. 找到 `Notion Connection`。
2. 点击 `Run Sync Now`。
3. 系统抓取 Notion 中 `同步状态 = 待同步` 的内容。
4. 内容进入 `Notion Review Pool`。

## 8. 审核 Notion 内容

1. 找到 `Notion Review Pool`。
2. 选择目标表：
   - Blog Articles
   - Disease Articles
   - Community Posts
3. 点击 `Refresh`。
4. 对每条内容：
   - `Confirm Sync`：审核通过并写入数据库
   - `Reject`：输入驳回原因，系统会回写 Notion 评论

## 9. 查看日志

后台有两类日志：

- `Operation Trail`：当前浏览器会话中的操作轨迹。
- `System Monitor`：权限与 Notion 工作流日志。

数据库审计表：

- `admin_operation_logs`
- `system_events`

超级管理员可用 SQL 或后台接口查看完整日志。

## 10. 异常处理

### Notion API key 失效

表现：

- 同步失败
- `system_events` 出现 critical/error

处理：

1. 超级管理员更新服务端 `NOTION_API_KEY` secret。
2. 重新部署或重启 Edge Function。
3. 手动触发 `Run Sync Now`。

### 字段不匹配

表现：

- 内容未进入审核池
- 系统监控出现字段映射提醒

处理：

1. 检查 Notion 字段是否包含 `标题`、`正文`、`标签`、`同步状态`。
2. 如需新增字段，在 `notion_field_mappings` 中增加映射。
3. 重新同步。

### 员工无法登录

检查：

1. 是否已被邀请。
2. 是否已激活。
3. `admin_users.is_active` 是否为 `true`。
4. IP 是否在 `auth_lockouts` 中处于锁定期。

