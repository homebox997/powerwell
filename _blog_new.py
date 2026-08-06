"""从模板创建新博客文章"""
import sys, re, os
from datetime import datetime

TEMPLATE = r'D:\temp\powerwell\repo\AU\blog\why-large-senior-dogs-face-more-heart-problems.html'
BLOG_DIR = r'D:\temp\powerwell\repo\AU\blog'

CATEGORIES = {
    'heart': 'Senior Dog Heart Health',
    'kidney': 'Senior Dog Kidney Health',
    'arthritis': 'Senior Dog Joint Health',
    'other': 'Senior Dog Health'
}

HERO_IMAGES = {
    'heart': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200&q=80',
    'kidney': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    'arthritis': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    'other': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80'
}

def create(slug, category, title, desc):
    """从模板创建新文章"""

    category = category.lower()
    if category not in CATEGORIES:
        print(f'❌ 无效分类: {category}')
        print(f'有效值: {list(CATEGORIES.keys())}')
        return False

    # 读取模板
    with open(TEMPLATE, 'r', encoding='utf-8') as f:
        content = f.read()

    # 替换
    eyebrow = CATEGORIES[category]
    hero = HERO_IMAGES[category]
    today = datetime.now().strftime('%-d %B %Y')
    year = datetime.now().year

    replacements = [
        (r'<title>.*?</title>', f'<title>{title} | PawWell Australia</title>'),
        (r'<meta name="description" content=".*?">', f'<meta name="description" content="{desc}">'),
        (r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://www.agedpawwell.com/AU/blog/{slug}.html">'),
        (r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">'),
        (r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{desc}">'),
        (r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="https://www.agedpawwell.com/AU/blog/{slug}.html">'),
        (r'<meta property="og:image" content=".*?">', f'<meta property="og:image" content="{hero}">'),
        (r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{desc}">'),
        (r'<meta name="twitter:image" content=".*?">', f'<meta name="twitter:image" content="{hero}">'),
        (r'"headline": ".*?"', f'"headline": "{title}"'),
        (r'"url": ".*?\.html"', f'"url": "https://www.agedpawwell.com/AU/blog/{slug}.html"'),
        (r'"datePublished": ".*?"', f'"datePublished": "{today}"'),
        (r'"dateModified": ".*?"', f'"dateModified": "{today}"'),
        (r'"image": ".*?"', f'"image": "{hero}"'),
        (r'<p class="eyebrow">.*?</p>', f'<p class="eyebrow">{eyebrow}</p>'),
        (r'<h1>.*?</h1>', f'<h1>{title}</h1>'),
        (r'Published .*?\s*2026', f'Published {today}'),
        (r'<img src=".*?" alt=".*?">', f'<img src="{hero}" alt="{title}">'),
    ]

    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)

    # 面包屑分类
    if category == 'heart':
        content = re.sub(r'<a href="/AU/heart\.html">.*?</a>', f'<a href="/AU/heart.html">Heart Disease</a>', content)
    elif category == 'kidney':
        content = re.sub(r'<a href="/AU/heart\.html">.*?</a>', f'<a href="/AU/kidney.html">Kidney Disease</a>', content)
    elif category == 'arthritis':
        content = re.sub(r'<a href="/AU/heart\.html">.*?</a>', f'<a href="/AU/arthritis.html">Arthritis</a>', content)

    # 写入
    output = os.path.join(BLOG_DIR, f'{slug}.html')
    with open(output, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'✅ 已创建: {output}')
    print(f'\n下一步:')
    print(f'1. 编辑内容（保留结构）')
    print(f'2. 运行验收: py _blog_check.py {output}')
    print(f'3. 部署: py _blog_deploy.py {output} {slug} {category} "{title}" "{desc}"')
    return True

if __name__ == '__main__':
    if len(sys.argv) < 5:
        print('用法: python _blog_new.py <slug> <category> <title> <desc>')
        print('示例: python _blog_new.py my-article heart "标题" "描述"')
        print(f'\n分类: {list(CATEGORIES.keys())}')
        sys.exit(1)
    ok = create(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    sys.exit(0 if ok else 1)
