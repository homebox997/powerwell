"""博客部署验收脚本 v2 - 所有新博客必须通过此脚本（2026-08-06 强制执行指令版）

强制检查项（对应"博客发布强制执行指令"）：
A. 完整组件：顶部导航栏 / 面包屑 / 全站统一页脚
B. 配图：链接可加载、尺寸合规、标签完整、无违规源
C. 流量监控：GA4 埋点完整且在 head 内
D. 模板规范：无 Day X、表格、CTA、Related、Disclaimer、Meta 简洁
"""
import sys, re, os

def check_blog(filepath):
    errors = []
    with open(filepath, 'rb') as f:
        raw = f.read()
    enc = 'utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8'
    content = raw.decode(enc, errors='replace')

    # ========== A. 完整组件 ==========
    # A1. 顶部导航栏：logo + mainNav + 6 个导航链接
    if 'logo.png' not in content:
        errors.append('❌ 顶部导航栏缺失 logo（需 /AU/_shared/assets/logo.png）')
    if 'id="mainNav"' not in content and 'id="navMenu"' not in content:
        errors.append('❌ 顶部导航栏缺失 nav 容器（id=mainNav / navMenu）')
    nav_links = ['/AU/assessment.html', '/AU/arthritis.html', '/AU/kidney.html', '/AU/heart.html', '/AU/blog.html']
    missing_nav = [l for l in nav_links if l not in content]
    if missing_nav:
        errors.append(f'❌ 导航栏缺失链接: {missing_nav}')

    # A2. 面包屑导航
    if 'breadcrumb' not in content:
        errors.append('❌ 缺失面包屑导航')

    # A3. 全站统一页脚（© 2026 Aged Paw Well + 4 法务链接）
    if 'Aged Paw Well. All rights reserved' not in content:
        errors.append('❌ 页脚缺失版权行（© 2026 Aged Paw Well. All rights reserved.）')
    legal_links = ['Contact Us', 'Privacy Policy', 'Disclaimer', 'Terms']
    missing_legal = [l for l in legal_links if l not in content]
    if missing_legal:
        errors.append(f'❌ 页脚缺失法务链接: {missing_legal}')

    # ========== B. 配图检查 ==========
    imgs = re.findall(r'<img[^>]*>', content)
    if not imgs:
        errors.append('❌ 页面无任何 <img> 标签')
    for img in imgs:
        # B1. 标签完整（有 src 和 alt）
        if 'src=' not in img:
            errors.append(f'❌ 图片缺 src: {img[:80]}')
        if 'alt=' not in img:
            errors.append(f'❌ 图片缺 alt: {img[:80]}')
        # B2. 禁止 Unsplash（2026-08-06 配图规范）
        if 'unsplash' in img:
            errors.append(f'❌ 图片违规使用 Unsplash（必须 Pexels）: {img[:100]}')
        # B3. Pexels 图片必须是 w=800 尺寸（响应式规范）
        if 'pexels' in img and 'w=800' not in img and 'w=1200' not in img:
            m = re.search(r'w=(\d+)', img)
            errors.append(f'❌ Pexels 图片尺寸非标准（w={m.group(1) if m else "?"}，应 w=800）: {img[:100]}')

    # B4. Hero 图片
    if 'article-hero' not in content:
        errors.append('❌ 缺失 Hero 图片区域（article-hero）')

    # ========== C. 流量监控 ==========
    # C1. GA4 代码存在
    if 'G-H7DBWWV06J' not in content:
        errors.append('❌ 缺失 GA4 代码（G-H7DBWWV06J）')
    else:
        # C2. GA4 必须在 <head> 内（charset/viewport 后、</head> 前）
        head_m = re.search(r'<head[^>]*>(.*?)</head>', content, re.DOTALL)
        if head_m:
            if 'G-H7DBWWV06J' not in head_m.group(1):
                errors.append('❌ GA4 代码不在 <head> 内（埋点位置错误）')
        else:
            errors.append('❌ 未找到 <head> 标签')

    # ========== D. 模板规范 ==========
    # D1. 禁止 Day X
    if re.search(r'day\s*[0-9]', content, re.I):
        errors.append('❌ 包含 Day X 序号（必须删除）')
    # D2. 观察表格
    if '<table>' not in content:
        errors.append('❌ 缺失观察表格')
    # D3. CTA Strip
    if 'cta-strip' not in content:
        errors.append('❌ 缺失 CTA Strip')
    # D4. Related Articles
    if 'related-articles' not in content:
        errors.append('❌ 缺失 Related Articles')
    # D5. Vet Disclaimer
    if 'vet-disclaimer' not in content:
        errors.append('❌ 缺失 Vet Disclaimer')
    # D6. Meta 格式（禁止多余标记）
    if 'SOURCE CHECKED' in content or 'VET REVIEW REQUIRED' in content:
        errors.append('❌ Meta 含多余标记（仅保留 Published X）')
    # D7. 禁止中文（英文站规范）
    zh = re.findall(r'[\u4e00-\u9fff]', content)
    if zh:
        errors.append(f'❌ 页面含中文 {len(zh)} 字符（英文站必须全英文）')

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
