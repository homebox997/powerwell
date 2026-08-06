"""博客部署脚本 - 必须通过验收才能部署"""
import sys, subprocess, os, shutil, re
from pathlib import Path

REPO = r'D:\temp\powerwell\repo'
BLOG_DIR = os.path.join(REPO, 'AU', 'blog')
TEMPLATE = os.path.join(BLOG_DIR, 'why-large-senior-dogs-face-more-heart-problems.html')
CHECK_SCRIPT = os.path.join(REPO, '_blog_check.py')

def deploy(source_html, slug, category, title, excerpt):
    """部署博客文章（源文件 + 元数据）"""

    # 1. 目标文件
    target = os.path.join(BLOG_DIR, f'{slug}.html')

    # 2. 复制源文件
    shutil.copy2(source_html, target)
    print(f'✓ 复制到 {target}')

    # 3. 运行验收
    print('\n=== 验收检查 ===')
    result = subprocess.run(['py', CHECK_SCRIPT, target], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print('\n❌ 验收未通过，终止部署')
        print('请修正上述问题后重新运行')
        return False

    # 4. 更新 blog.html ARTICLES
    blog_html = os.path.join(REPO, 'AU', 'blog.html')
    with open(blog_html, 'rb') as f:
        raw = f.read()
    enc = 'utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8'
    blog_text = raw.decode(enc, errors='replace')

    if slug in blog_text:
        print('✓ blog.html 已包含此文章')
    else:
        new_entry = f'''    {{
      slug: '{slug}',
      title: '{title}',
      category: '{category}',
      excerpt: '{excerpt}',
      date: 'August 6, 2026',
      readTime: '7 min',
      img: '/AU/assets/{category}-og.jpg',
      pinned: false
    }},'''
        # 插入到第一个 pinned: false 后面
        m = re.search(r'(pinned:\s*false\s*\}\s*,\s*)', blog_text)
        if m:
            blog_new = blog_text[:m.end()] + '\n' + new_entry + blog_text[m.end():]
            with open(blog_html, 'w', encoding=enc) as f:
                f.write(blog_new)
            print('✓ blog.html ARTICLES 已更新')
        else:
            print('⚠ 未找到插入位置')

    # 5. 更新 sitemap
    sitemap = os.path.join(REPO, 'sitemap.xml')
    with open(sitemap, 'rb') as f:
        raw = f.read()
    enc = 'utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8'
    sm_text = raw.decode(enc, errors='replace')
    url = f'https://agedpawwell.com/AU/blog/{slug}.html'
    if url not in sm_text:
        sm_text = sm_text.replace('</urlset>', f'  <url>\n    <loc>{url}</loc>\n  </url>\n</urlset>')
        with open(sitemap, 'w', encoding=enc) as f:
            f.write(sm_text)
        print('✓ sitemap.xml 已更新')

    # 6. Git 提交
    os.chdir(REPO)
    subprocess.run(['git', 'add', f'AU/blog/{slug}.html', 'AU/blog.html', 'sitemap.xml'], check=True)
    subprocess.run(['git', 'commit', '-m', f'deploy: {title}'], check=True)
    subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True)
    print(f'\n✅ 部署完成: {url}')
    return True

if __name__ == '__main__':
    if len(sys.argv) < 6:
        print('用法: python _blog_deploy.py <源HTML> <slug> <category> <title> <excerpt>')
        print('示例: python _blog_deploy.py draft.html my-article kidney "标题" "摘要"')
        sys.exit(1)
    ok = deploy(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    sys.exit(0 if ok else 1)
