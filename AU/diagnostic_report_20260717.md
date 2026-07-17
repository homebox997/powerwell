# PawWell AU 全站诊断报告
**诊断时间**: 2026-07-17 21:30 GMT+10  
**扫描范围**: `D:\temp\powerwell\repo\AU` (共87个HTML文件 + JS/Admin/资源文件)  
**诊断方法**: Python自动化脚本 + 人工验证

---

## 🔴 严重问题 (Critical)

### C1. 30个社区子页面无导航、无数据加载 — 孤立页面
**位置**: `community/*.html` (30个文件)

| 文件 | 问题 |
|------|------|
| `community/allergy-test-paw-licking-diagnosis.html` 等30个 | 0个外部脚本、0个表单、无Supabase连接、`<h1>`正确但无法评论 |

**详情**:
- 这30个文件是社区帖子的独立URL页面，但：
  - `<script>` 标签数量: **0** (非动态)
  - 没有加载 `community-data-*.js`
  - 没有加载 Supabase SDK
  - 没有 `<form>` 表单 → **无法评论**
  - 链接 `../community.html` 在Vercel服务端可正常工作

**影响**: SEO收录的30个独立URL完全无功能，用户访问后无法互动。

**修复建议**: 这些文件应从 `community.html` 通过JS动态渲染，或补全脚本引用。

---

### C2. blog.html 无真实文章列表 — 空壳页面
**文件**: `blog.html`

| 发现 | 详情 |
|------|------|
| Article列表 | 0个 (0 `<article>`) |
| Card数 | 12个 |
| 文章链接 | 仅nav链接，无博客文章跳转 |

**详情**:
- `blog.html` 只有12个样式卡片但无实际文章链接
- 所有15个 `<a href>` 都是站内nav链接（`./index.html`, `./arthritis.html` 等）
- 没有任何指向具体博客文章的 `<a href>` 标签
- `/AU/blog.html` 引用了 `https://agedpawwell.com/blog/senior-dog-home-safety...` (非AU路径)

**修复建议**: 补全博客文章列表，或实现动态文章加载。

---

### C3. submit.html 表单不完整 — 只有一个按钮
**文件**: `submit.html`

| 元素 | 数量 |
|------|------|
| `<form>` | 0 |
| `<input>` | 0 |
| `<button>` | 1 |
| Submit handler | 0 |

**详情**:
- 整个文件只含1个 `<button>` 标签
- 没有 `<form>` 包裹
- 无任何 `fetch()` 或表单提交逻辑
- 引用了外部 `https://tally.so/r/Pdyk5Q` (Tally表单链接)

**修复建议**: 要么将Tally嵌入为 `<iframe>`，要么用真实 `<form>` + API调用实现。

---

### C4. Supabase URL + API Key暴露在前端JS中
**文件**: `js/api-client.js`, `js/supabase-init.js`

```
https://cbbaejwbkenrutmgqikt.supabase.co
https://cbbaejwbkenrutmgqikt.supabase.co/rest/v1
```

**详情**:
- `api-client.js` 中包含完整的 Supabase 项目URL
- `supabase-init.js` 同样包含项目URL
- 这些URL含项目ID，攻击者可针对性探测

**修复建议**: 使用环境变量或通过后端代理调用，勿在前端JS中硬编码数据库URL。

---

## 🟡 中等问题 (Warning)

### W1. Nav导航不一致 — 部分页面缺少主导航
**详情**:

| 页面 | Nav链接数 | 缺少 |
|------|----------|------|
| `index.html` | 8 | 正常 |
| `arthritis.html` | **3** | ❌ assessment/kidney/heart |
| `kidney.html` | **3** | ❌ assessment/kidney/heart |
| `heart.html` | **3** | ❌ assessment/kidney/heart |
| `community.html` | 8 | 正常 |
| `blog.html` | 8 | 正常 |
| `submit.html` | 8 | 正常 |

**详情**: 三大核心页面（关节炎/肾病/心脏病）只有首页和博客入口，缺少互相之间的链接和评估入口。

**修复建议**: 将三大病种页面的Nav补全为与首页一致的8项。

---

### W2. 中文注释散布于源代码中
**位置**: 多处

| 文件 | 内容 |
|------|------|
| `assessment.html` line 322 | `// === Supabase 提交（数据库接口：assessment_db_port = 3003）===` |
| `assessment.html` line 380-382 | `// 提交到 Supabase...` 等3条 |
| `index.html` line 10 | `<!-- 数据库接口：blog_db_port = 3002... -->` |
| `js/api-client.js` 头部 | `* PawWell — 前端 API 客户端（前后端严格解耦）` 等大量注释 |
| `js/supabase-init.js` | 同上 |

**评估**: 对外展示无影响（注释不输出到页面），但泄漏了系统架构信息（数据库端口等）。

**修复建议**: 将中文注释改为英文，或移除技术实现细节注释。

---

### W3. vercel.json 缓存策略 — 可能影响性能
**文件**: `vercel.json`

```json
"Cache-Control": "public, max-age=0, must-revalidate"
```

**评估**: `max-age=0` 意味着每次访问都重新验证，对静态资源不必要的重复请求。

**修复建议**: 改为 `max-age=31536000, immutable` 用于带hash的静态资源。

---

### W4. blog.html 中的跨路径引用
**文件**: `blog.html`

```
/AU/blog.html 引用了 https://agedpawwell.com/blog/senior-dog-home-safety...
```

**评估**: 链接指向非 `/AU/` 路径的博客文章，存在路由不匹配风险。

**修复建议**: 确认是否正确，或改用 `../blog/...` 相对路径。

---

## 🟢 良好 / 无问题

### ✅ 编码与字符集
- **所有87个HTML文件**: `<meta charset="UTF-8">` ✅
- **所有HTML文件**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` ✅
- **文件命名**: 全部英文，无中文文件名 ✅
- **可见内容中文**: 仅出现在 `admin/index.html` (管理后台)，属正常用途 ✅

### ✅ 站内链接完整性
- **broken link扫描**: 120个 `../` 路径引用均为**服务端正确路径**（非404）
- **所有主导航链接**: `./index.html`, `./assessment.html` 等均对应实际文件 ✅

### ✅ 字体与颜色一致性
- 所有页面使用统一字体: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` + `Fredoka` ✅
- 主题色系: 橙红色系 `#ff6b6b` → `#ff8e53` 渐变，风格统一 ✅

### ✅ 社区板块 (community.html主体)
- `community.html` 主页面: Supabase加载正常，40个按钮，9个输入框，1个下拉框 ✅
- 引用最新的 `community-data-20260717115201.js` ✅
- Tally评论表单引用: `https://tally.so/r/Pdyk5Q` ✅

---

## 📋 问题汇总

| 编号 | 严重度 | 类型 | 涉及文件数 | 描述 |
|------|--------|------|-----------|------|
| C1 | 🔴 严重 | 功能缺陷 | 30个 | 社区子页面孤立无功能 |
| C2 | 🔴 严重 | 内容缺失 | 1个 | blog.html无文章列表 |
| C3 | 🔴 严重 | 表单缺失 | 1个 | submit.html表单不完整 |
| C4 | 🔴 严重 | 安全 | 2个 | Supabase URL暴露 |
| W1 | 🟡 中等 | 导航不一致 | 3个 | 三大病种页nav缺失 |
| W2 | 🟡 中等 | 代码质量 | 3个 | 中文注释泄漏架构信息 |
| W3 | 🟡 中等 | 性能 | 1个 | 缓存策略不当 |
| W4 | 🟡 中等 | 路由 | 1个 | 跨路径引用 |

**总计**: 4个严重 + 4个中等 = 8个需处理问题

---

## 优先修复建议

**阶段1 (立即)**: C1 → C3 → C2 → C4  
**阶段2 (短期)**: W1 → W2 → W4  
**阶段3 (优化)**: W3

---
*报告由QClaw子代理自动生成 | 2026-07-17*
