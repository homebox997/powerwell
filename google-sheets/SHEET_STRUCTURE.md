# PawWell — Google Sheet 字段结构（数据表设计）

> 目标：把宠物站全部业务数据从 Supabase(NoSQL) 迁移到 Google Sheet。
> 本文件定义每个数据表的「工作表标签名 + 列结构」，供 Code.gs 与应用端对照。

## 1. assessments（AI 健康自测提交）
| 列 | 字段 | 说明 |
|----|------|------|
| A | id | 唯一ID，格式 a_xxx |
| B | breed | 犬种 |
| C | gender | 性别 |
| D | nickname | 宠物昵称 |
| E | symptoms | 症状列表，用 ` | ` 分隔 |
| F | symptom_count | 症状数量 |
| G | detected_areas | 关注系统，用 ` | ` 分隔 |
| H | email | 用户邮箱（可空） |
| I | country | 国家，默认 AU |
| J | created_at | 提交时间 ISO |

## 2. community_posts（社区帖子）
| 列 | 字段 | 说明 |
|----|------|------|
| A | id | 唯一ID，格式 p_xxx |
| B | user_id | 用户ID |
| C | author_name | 作者名 |
| D | dog_name | 狗狗名 |
| E | breed | 犬种 |
| F | content | 正文 |
| G | tags | 标签，用 ` | ` 分隔 |
| H | likes | 点赞数 |
| I | comments | 评论数 |
| J | views | 浏览数 |
| K | is_approved | 是否审核通过（FALSE/TRUE） |
| L | created_at | 创建时间 |

## 3. community_comments（社区评论）
| 列 | 字段 | 说明 |
|----|------|------|
| A | id | 唯一ID，格式 c_xxx |
| B | post_id | 所属帖子ID |
| C | author_name | 评论者 |
| D | content | 评论内容 |
| E | is_approved | 是否审核通过 |
| F | created_at | 创建时间 |

## 4. leads（投稿/询盘）
| 列 | 字段 | 说明 |
|----|------|------|
| A | id | 唯一ID，格式 l_xxx |
| B | name | 姓名 |
| C | email | 邮箱 |
| D | content_type | 投稿类型 |
| E | message | 内容 |
| F | created_at | 创建时间 |

## 5. blog_articles（博客文章，可选）
| 列 | 字段 | 说明 |
|----|------|------|
| A | id | 唯一ID |
| B | title | 标题 |
| C | slug | 网址别名 |
| D | excerpt | 摘要 |
| E | cover_image | 封面图URL |
| F | category | 分类 |
| G | tags | 标签 |
| H | body | 正文HTML |
| I | country | 国家 |
| J | created_at | 创建时间 |

## 迁移步骤
1. 在 Google Drive 新建一个 Google Sheet 文件，记下文件 ID。
2. 把文件 ID 填入 Code.gs 的 `SS_ID`。
3. 部署 Code.gs 为 Web App，复制部署 URL。
4. 把 URL 填入 js/gs-api-client.js 的 `SCRIPT_URL`。
5. 切换前端：把页面里的 `api-client.js`(Supabase) 改为引用 `gs-api-client.js`。
