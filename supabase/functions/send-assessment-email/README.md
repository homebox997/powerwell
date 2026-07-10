# send-assessment-email

当用户提交 AI Health Check 表单时，自动发送个性化邮件报告。

## 触发流程

```
用户提交 assessment.html
    ↓
数据写入 Supabase assessments 表
    ↓
数据库 Trigger 触发
    ↓
调用 Edge Function
    ↓
发送邮件到用户邮箱（通过 Resend）
```

## 环境变量（必需）

在 Supabase Dashboard 中设置：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `RESEND_API_KEY` | Resend 邮件 API Key | [resend.com](https://resend.com) 注册并获取 |

### 设置 Resend

1. 访问 [resend.com](https://resend.com) 注册账号
2. 添加域名 `agedpawwell.com` 并验证 DNS（按 Resend 指引添加 TXT/MX 记录）
3. 在 API Keys 页面创建 Key（格式：`re_xxxx`）
4. 在 Supabase Dashboard → Edge Functions → Secrets 添加 `RESEND_API_KEY`

## 数据库 Trigger 设置

运行以下 SQL（在 Supabase Dashboard → SQL Editor）：

```sql
-- 创建 webhook 函数（调用 Edge Function）
CREATE OR REPLACE FUNCTION notify_assessment_email()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/functions/v1/send-assessment-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
    body := json_build_object(
      'type', 'INSERT',
      'table', 'assessments',
      'record', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_assessment_created ON assessments;
CREATE TRIGGER on_assessment_created
  AFTER INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assessment_email();
```

## 测试

### 方式1：直接 HTTP POST

```bash
curl -X POST https://cbbaejwbkenrutmgqikt.supabase.co/functions/v1/send-assessment-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "breed": "Golden Retriever",
    "gender": "Male",
    "nickname": "Max",
    "symptoms": ["Limping in the morning", "Stiffness after rest"],
    "detected_areas": ["Joint & Mobility"],
    "symptom_count": 2,
    "email": "YOUR_TEST_EMAIL@example.com",
    "country": "AU"
  }'
```

### 方式2：通过 assessment.html 表单提交

1. 填写表单并输入自己的邮箱
2. 提交后检查邮箱

## 邮件内容

- 品牌一致的 HTML 邮件模板（PawWell 配色）
- 显示狗狗昵称、品种、性别
- 紧迫度评估（🟢🟡🟠）
- 检测到的健康领域（带标签）
- 症状列表
- 行动建议
- 相关健康文章推荐链接
- 再次评估按钮

## 邮件不发送的情况

- 用户未填写邮箱（`email` 字段为空）
- `RESEND_API_KEY` 未设置
- Resend 账户额度用尽

## 监控

- Supabase Dashboard → Logs → Edge Functions
- Resend Dashboard → Emails → 查看发送记录
