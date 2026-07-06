# PowerWell 后台权限与 Notion 自动对接设计说明

## 一、后台权限管理系统

### 1. 核心权限架构

| 角色 | 使用人 | 权限范围 | 禁止事项 |
| --- | --- | --- | --- |
| 超级管理员 | 创始人 | 系统配置、权限分配、数据删除、日志查看、Notion 密钥配置、数据库底层结构调整 | 无 |
| 管理员 | Amy 等被授权管理员 | 员工邀请、员工管理、内容审核、数据导出、普通数据读写 | 不可修改 API 参数、权限架构、Notion 密钥、数据库底层结构 |
| 员工 | 被邀请成员 | 默认无权限；激活后按邀请范围获得只读、审核或非核心字段编辑权限 | 未邀请不可登录；不可越权读写 |

后台角色已落到数据库：

- `super_admin`
- `admin`
- `employee_viewer`
- `employee_reviewer`
- `employee_editor`

### 2. 邀请与激活

管理员或超级管理员可在后台填写：

- 员工姓名
- 员工邮箱
- 初始角色
- 权限范围

系统会创建 `admin_invitations` 记录和激活 token。正式生产环境应由 Supabase Auth 或自有邮件服务发送激活链接。员工通过链接激活后，`admin_users.activated_at` 写入时间，权限即时生效。

未被邀请、未激活或被停用的用户不能通过后台 RPC。

### 3. 权限审批规则

- 员工权限变更会进入 `permission_change_requests`。
- 普通员工角色调整可由管理员或超级管理员审批。
- 升级为管理员、超级管理员，或管理员发起的重大权限变更，必须由超级管理员确认。
- 所有审批动作进入 `admin_operation_logs`。

### 4. IP 锁定

`auth_lockouts` 用于记录未授权或失败登录：

- 未授权员工尝试访问后台时，记录 IP。
- 未授权访问会触发 15 分钟锁定。
- 连续失败达到阈值也会锁定 15 分钟。

注意：真正的 IP 锁定需要在 API Gateway、Edge Function 或登录代理层调用 `app_api.admin_register_login_attempt()`，因为浏览器前端不能可靠判断真实 IP。

### 5. 操作日志

所有后台关键操作均记录：

- 操作人邮箱
- 操作角色
- 操作时间
- 操作类型
- 目标表
- 目标记录
- 操作内容

日志表：

- `admin_operation_logs`
- `system_events`

超级管理员和管理员可查看系统监控，超级管理员可完整审计。

## 二、后台与 Notion 自动对接

### 1. 前置条件

Notion 侧：

- 超级管理员在 Notion 工作台创建数据源数据库。
- 数据库字段至少包含：
  - `标题`
  - `正文`
  - `标签`
  - `同步状态`
- Notion 集成需有读取内容、编辑内容、评论权限。
- 数据源数据库需分享给该 Notion 集成。

后台侧：

- 超级管理员在后台绑定 Notion 工作区和数据源 ID。
- Notion API key 只能保存在服务端密钥中，不允许写入浏览器文件。
- `supabase/functions/notion-sync` 负责实际抓取和回写。

### 2. 自动抓取

定时任务：

- 每天 08:00 Australia/Sydney
- 每天 20:00 Australia/Sydney

也支持后台点击 `Run Sync Now` 手动触发。

同步逻辑：

1. 调用 Notion Data Source Query API，筛选 `同步状态 = 待同步`。
2. 读取页面 block children。
3. 自动字段映射：
   - Notion `标题` -> 后台 `content_title`
   - Notion `正文` -> 后台 `content_body`
   - Notion `标签` -> 后台 `content_tag`
4. 转换格式：
   - 斜体 -> `<i>`
   - 加粗 -> `<b>`
   - 图片 -> `<img>`
   - 文件/PDF -> `[点击下载]` 链接按钮
   - 表格 -> 后台兼容 `<table>` 结构
5. 写入 `notion_review_pool`，状态为 `pending_review`。

### 3. 审核与入库

管理员 Amy 或超级管理员可在后台 `Notion Review Pool` 审核：

- 点击 `Confirm Sync`：
  - 内容写入目标业务表，例如 `blog_articles`
  - 审核池状态更新
  - Notion 页面状态回写为 `已同步`
- 点击 `Reject`：
  - 填写驳回原因
  - 审核池状态变为待评论
  - 同步工作器向 Notion 页面添加评论：`需修改：xxx`

### 4. 异常处理

系统监控页显示：

- Notion API key 失效
- 字段不匹配
- 网络中断
- Notion 服务异常
- 同步任务失败

关键异常会写入 `system_events`。Notion key 失效时应暂停同步，并通知超级管理员更新密钥。

## 三、已交付文件

- `admin/index.html`
- `admin/config.js`
- `admin/admin.js`
- `admin/permission-notion.js`
- `admin/styles.css`
- `supabase_permission_notion_extension.sql`
- `supabase/functions/notion-sync/index.ts`
- `PowerWell_admin_permission_notion_design_20260707.md`
- `PowerWell_admin_operation_manual_20260707.md`

## 四、官方 API 依据

- Notion API 使用 Bearer token、`https://api.notion.com`、分页和 data source query。
- 当前 Notion API 版本使用 `Notion-Version: 2026-03-11`。
- 页面内容通过 block children 读取。
- 驳回意见通过 Notion Comments API 写入页面评论。

