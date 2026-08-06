"""博客部署验收脚本 - 所有新博客必须通过此脚本"""
import sys, re

def check_blog(filepath):
    errors = []
    with open(filepath, 'rb') as f:
        raw = f.read()
    enc = 'utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8'
    content = raw.decode(enc, errors='replace')

    # 1. 禁止 Day X
    if re.search(r'day\s*[0-9]', content, re.I):
        errors.append('❌ 包含 Day X 序号（必须删除）')

    # 2. GA4
    if 'G-H7DBWWV06J' not in content:
        errors.append('❌ 缺失 GA4 代码')

    # 3. 面包屑
    if 'breadcrumb' not in content:
        errors.append('❌ 缺失面包屑导航')

    # 4. Hero 图片
    if 'article-hero' not in content:
        errors.append('❌ 缺失 Hero 图片')

    # 5. 表格
    if '<table>' not in content:
        errors.append('❌ 缺失观察表格')

    # 6. CTA
    if 'cta-strip' not in content:
        errors.append('❌ 缺失 CTA Strip')

    # 7. Related
    if 'related-articles' not in content:
        errors.append('❌ 缺失 Related Articles')

    # 8. Footer
    if 'Contact Us' not in content or 'Privacy Policy' not in content:
        errors.append('❌ 缺失完整 Footer')

    # 9. Disclaimer
    if 'vet-disclaimer' not in content:
        errors.append('❌ 缺失 Vet Disclaimer')

    # 10. Meta 格式检查
    if 'SOURCE CHECKED' in content or 'VET REVIEW REQUIRED' in content:
        errors.append('❌ Meta 含多余标记（仅保留 Published X）')

    if errors:
        print(f'\n验收失败: {filepath}')
        for e in errors:
            print(e)
        return False
    else:
        print(f'✅ 验收通过: {filepath}')
        return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python _blog_check.py <文章路径>')
        sys.exit(1)
    ok = check_blog(sys.argv[1])
    sys.exit(0 if ok else 1)
