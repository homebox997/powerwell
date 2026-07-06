# PowerWell 独立后台系统说明

## 已交付文件

- `admin/index.html`：独立后台入口
- `admin/config.js`：数据库连接与协议配置
- `admin/admin.js`：数据接入层、权限镜像、操作日志、页面交互
- `admin/styles.css`：后台界面样式
- `admin/README.md`：英文快速说明
- `supabase_admin_extension.sql`：后台权限与审计日志数据库扩展

## 四层结构

### 1. 数据接入层

后台内置 4 种协议适配：

- `Supabase RPC`：推荐生产模式，只调用 `app_api` 下的安全函数
- `REST API`：适配未来自有后端
- `PostgREST`：适配 Supabase 原生 REST
- `Local Mock`：离线演示和调试

生产环境建议只启用 `Supabase RPC` 或自有 `REST API`，不要让运营人员直接使用 PostgREST 写表。

### 2. 交互层

后台提供可视化操作界面：

- 表/集合切换
- 国家过滤，默认 `Australia`
- 记录列表
- JSON 内容编辑
- 新增、更新、删除
- 本地操作轨迹面板

后台是独立目录，不改动 `AU/` 下现有页面展示逻辑。

### 3. 权限层

前端界面镜像 3 个角色：

- `viewer`：只读
- `editor`：读取、新增、更新
- `admin`：读取、新增、更新、删除、审计查询

真正的权限控制在 `supabase_admin_extension.sql` 中执行：

- `admin_users` 保存后台用户与角色
- `app_api.require_admin_role()` 校验当前 Supabase 登录用户
- 所有写入和删除必须通过 `app_api.admin_*` 函数
- 客户端角色没有直接读写后台权限表和日志表的权限

### 4. 日志层

日志分两层：

- 浏览器本地日志：用于即时查看当前操作轨迹
- 数据库审计日志：`admin_operation_logs` 记录所有通过后台 RPC 发生的读、写、删操作

审计日志包含：

- 操作人邮箱
- 操作角色
- 动作类型
- 目标表
- 目标记录 ID
- 国家
- 操作 payload
- 时间戳

## 部署步骤

1. 先执行 `supabase_au_minimal_schema.sql`。
2. 再执行 `supabase_admin_extension.sql`。
3. 在 Supabase Authentication 创建后台用户。
4. 在 SQL Editor 添加后台用户角色，例如：

```sql
insert into public.admin_users (email, role, country)
values ('admin@example.com', 'admin', 'Australia');
```

5. 在 Supabase API 设置里暴露 `app_api` schema。
6. 在 `admin/config.js` 填入 Supabase URL 和 anon key。
7. 打开 `admin/index.html`，使用 Supabase 用户邮箱和密码登录。

## 安全边界

- 后台 UI 的角色控制只是操作体验层，不能作为唯一安全边界。
- 生产安全边界必须放在 Supabase RLS、RPC 函数和自有 API 层。
- 不建议在生产环境开放 PostgREST 直接写入模式。
- 删除操作只允许 `admin` 角色，并会写入审计日志。

