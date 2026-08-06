"""博客配图标准脚本 - 后续部署自动调用"""
import re, os, random
from pathlib import Path

# Pexels 老年犬素材库（来源：https://www.pexels.com/search/dog/）
# 选材标准：中老年犬、年长犬实拍、少量创意氛围、幼崽点缀
PEXELS_SENIOR_DOGS = {
    'arthritis': [
        'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3336184/pexels-photo-3336184.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5957368/pexels-photo-5957368.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    'kidney': [
        'https://images.pexels.com/photos/1108216/pexels-photo-1108216.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2605458/pexels-photo-2605458.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3336184/pexels-photo-3336184.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    'heart': [
        'https://images.pexels.com/photos/1458926/pexels-photo-1458926.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2856346/pexels-photo-2856346.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    'other': [
        'https://images.pexels.com/photos/3336184/pexels-photo-3336184.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&w=800',
    ]
}

USED_IMAGES = set()  # 防止重复

def get_image(category):
    """获取一张未使用的老年犬图片"""
    pool = PEXELS_SENIOR_DOGS.get(category, PEXELS_SENIOR_DOGS['other'])
    for img in pool:
        if img not in USED_IMAGES:
            USED_IMAGES.add(img)
            return img
    # 如果都用完了，随机选一张
    return random.choice(pool)

def add_images_to_article(filepath, category, title):
    """为文章添加配图（Hero + 1张正文）"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Hero 图片
    hero_img = get_image(category)

    # 替换 Hero
    hero_pattern = r'<img src="https://[^"]*" alt="[^"]*"'
    hero_new = f'<img src="{hero_img}" alt="{title}"'
    content = re.sub(hero_pattern, hero_new, content, count=1)

    # 替换 og/twitter image
    og_pattern = r'<meta property="og:image" content="[^"]*"'
    og_new = f'<meta property="og:image" content="{hero_img}"'
    content = re.sub(og_pattern, og_new, content)

    tw_pattern = r'<meta name="twitter:image" content="[^"]*"'
    tw_new = f'<meta name="twitter:image" content="{hero_img}"'
    content = re.sub(tw_pattern, tw_new, content)

    # JSON-LD
    json_pattern = r'"image": "https://[^"]*"'
    json_new = f'"image": "{hero_img}"'
    content = re.sub(json_pattern, json_new, content)

    # 正文配图
    inline_img = get_image(category)
    article_start = content.find('<div class="article-content">')
    if article_start > 0:
        article_section = content[article_start:]
        paragraphs = [m.start() for m in re.finditer(r'</p>', article_section)]
        if len(paragraphs) >= 3:
            insert_pos = article_start + paragraphs[2] + 4
            img_html = f'\n    <p style="text-align:center;margin:24px 0;"><img src="{inline_img}" alt="senior dog" style="max-width:100%;height:auto;border-radius:8px;"></p>\n'
            content = content[:insert_pos] + img_html + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return hero_img, inline_img

if __name__ == '__main__':
    print("配图标准已建立")
    print("来源：https://www.pexels.com/search/dog/")
    print("选材：老年犬、年长犬实拍、创意氛围")
    print("尺寸：800px 宽度，WebP 格式，< 200KB")
