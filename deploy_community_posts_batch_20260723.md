# 社区帖批量修复部署记录 — 2026-07-23

## 任务
修复 30 个社区帖页面的结构性问题（与博客模板对齐）：
- share-bar 错放在 `<head>` 内导致解析异常
- 缺少 Google Fonts（Fredoka）
- CSS 链接放在 head 末尾，加载时序差
- 导航/面包屑/CTA 使用绝对 URL
- 缺失 ARIA 无障碍属性

## 结果
**30/30 全部完成**（其中 car-ramp 在之前已修，allergy-test 本次单独修，剩余 28 个批量修）

## commit 列表
| commit | 文件 | 说明 |
|--------|------|------|
| `af00afa` | car-ramp-for-small-senior-dog.html | 之前已修 |
| `8d85be1` | allergy-test-paw-licking-diagnosis.html | 首修 |
| `046e757` | 28 个社区帖 | 批量修复 |

## 改动（聚合）
- 28 个文件，+1232 -1092 行（每文件 +44 -39）
- 总文件大小变化：每文件约 +368 字节

## 修复内容（每文件一致）
1. **Google Fonts**：在 `<head>` 顶部添加 Fredoka 字体 preconnect + link
2. **CSS 提前**：`<link rel="stylesheet">` 从 head 末尾移到 viewport meta 之后
3. **share-bar 移位**：从 `<head>` 移到 `<body>` 底部（在 cta-strip 之前），保留 noscript 兜底
4. **ARIA 属性**：header 加 `role="banner"`，nav 加 `role="navigation" aria-label="Main navigation"`，logo 加 `aria-label="PawWell Home"`，hamburger 加 `aria-label="Toggle menu"`
5. **相对路径**：9 处 `https://agedpawwell.com/AU/...` 改为 `/AU/...`
6. **面包屑**：Home/Community 链接相对化

## 验证
- 本地：5 个抽样文件全部 10/10 检查通过
- 线上：3 个抽样 URL HTTP 200，页面渲染正常
- 浏览器截图：字体、UI、评论、CTA、面包屑全部正常

## 涉及文件
best-elevated-bowls-arthritic-dog, bone-broth-senior-dog-joints, border-collie-drinking-more-water, bunnings-ramp-for-old-cavoodle, cardiologist-visit-cost-breakdown, cavalier-night-coughing-heart, daily-feeding-schedule-13-year-old-staffy, daily-teeth-brushing-senior-dog, elevated-kidney-values-beagle, fish-oil-dosage-senior-dog, fresh-food-diet-senior-labrador, german-shepherd-recurring-hot-spots, golden-retriever-persistent-scratching, grade-2-heart-murmur-labrador, greyhound-osteoarthritis-diagnosis, hiding-dog-medication-tricks, kelpie-stiffness-at-7-years, librela-injection-arthritis-experience, mentally-stimulating-old-dog, multiple-medications-senior-dog, oatmeal-baths-itchy-dogs, old-mate-struggling-on-stairs, raw-diet-cleared-staffy-skin, senior-dog-refusing-kibble, shih-tzu-coat-thinning-senior, swimming-hydrotherapy-senior-dog, training-treats-for-senior-dog, when-switch-senior-food-border-collie, allergy-test-paw-licking-diagnosis

## 已知遗留
- 404.html 结构差异，未在本次脚本范围（无 share-bar、无 cta-strip，结构不同）
- CSS 文件本身未动（@import 链路、Fredoka 变量定义），本次仅修 HTML 结构