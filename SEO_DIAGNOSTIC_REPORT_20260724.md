# SEO Technical Diagnostic Report — agedpawwell.com/AU/
**Audit Date:** 2026-07-24
**Auditor:** SEO Technical Subagent
**Scope:** Full site audit of https://www.agedpawwell.com/AU/

---

## 1. Executive Summary

**Overall Site Health Score: 68/100** ⚠️

The site has a solid structural foundation — good canonical tags, structured data, and consistent robots directives across key pages. However, there are **four critical issues** that are actively breaking SEO and user experience, plus multiple high-priority improvements needed.

**Key Findings:**
- ✅ No noindex/nofollow blocks on important pages
- ✅ Consistent `index, follow` across all key pages
- ✅ Good canonical URL discipline on disease pages (arthritis, kidney, heart)
- ✅ Rich structured data (BreadcrumbList, FAQPage, Article) on disease pages
- ✅ Google Fonts via CDN with preconnect
- ✅ Responsive design with viewport meta
- ✅ ARIA landmarks and keyboard accessibility
- ❌ **CRITICAL: sitemap.xml domain mismatch** (www vs non-www)
- ❌ **CRITICAL: blog article links are broken** — blog.html links to `/AU/slug.html` but files live at `/AU/blog/slug.html`
- ❌ **CRITICAL: sitemap.xml lists wrong blog article URLs** (`/AU/slug.html` instead of `/AU/blog/slug.html`)
- ❌ **CRITICAL: homepage has HTML encoding corruption** — hamburger button icon is `鈽?` instead of `☰`
- ⚠️ All blog articles missing Open Graph tags entirely
- ⚠️ Homepage missing `<meta name="keywords">` tag
- ⚠️ og:image inconsistency across pages — disease pages use `og-default.jpg` (non-existent path), others use `assets/og-image.png`

---

## 2. Google Index Coverage

**Search Result:** `site:agedpawwell.com` — Multiple pages indexed including index.html, community.html, blog.html, disease pages, and blog articles. The site appears to be in Google's index.

**Confirmed Indexed Pages:**
| Page | URL | Status |
|---|---|---|
| Homepage | `https://www.agedpawwell.com/AU/` | ✅ Indexed |
| Community | `https://www.agedpawwell.com/AU/community.html` | ✅ Indexed |
| Blog Listing | `https://www.agedpawwell.com/AU/blog.html` | ✅ Indexed |
| Arthritis Guide | `https://www.agedpawwell.com/AU/arthritis.html` | ✅ Indexed |
| Kidney Guide | `https://www.agedpawwell.com/AU/kidney.html` | ✅ Indexed |
| Heart Guide | `https://www.agedpawwell.com/AU/heart.html` | ✅ Indexed |
| Assessment | `https://www.agedpawwell.com/AU/assessment.html` | ✅ Indexed |

**Sitemap Analysis (sitemap.xml):**
- Contains 41 URLs total
- Homepage priority: 1.0 ✅
- Disease pages priority: 0.9 ✅
- Assessment priority: 0.9 ✅
- Blog listing priority: 0.9, changefreq: weekly ✅
- Community priority: 0.9, changefreq: daily ✅
- Blog articles: 36 URLs, priority: 0.7 each
- ❌ **Blog article URLs in sitemap are WRONG** — sitemap lists `/AU/slug.html` but actual files are at `/AU/blog/slug.html`. This means Google is being told to crawl non-existent URLs.
- ❌ **Sitemap domain mismatch** — sitemap references `agedpawwell.com` (no www) but canonicals and OG tags use `www.agedpawwell.com`. The Sitemap directive in robots.txt also points to `https://agedpawwell.com/sitemap.xml` (wrong path entirely).

**Noindex/NoFollow Check:** All key pages set `robots: index, follow` ✅

---

## 3. Critical Issues (P0) — Fix Immediately

### P0-1: Sitemap Domain Mismatch
**Severity:** CRITICAL
**File:** `sitemap.xml` and `robots.txt`

- `robots.txt` line: `Sitemap: https://agedpawwell.com/sitemap.xml`
  - Points to root domain, not the `/AU/` subdirectory
- `sitemap.xml` contains URLs with domain `agedpawwell.com` (no www)
  - Canonical tags on all pages use `https://www.agedpawwell.com/AU/...` (with www)
- **Impact:** Sitemap and canonical mismatch confuses Google about the canonical domain. Google's crawl budget is wasted on non-preferred domain.

**Fix Required:**
```
robots.txt: Sitemap: https://www.agedpawwell.com/AU/sitemap.xml
sitemap.xml: Change all loc domains from agedpawwell.com → www.agedpawwell.com
```

---

### P0-2: Blog Article URL Path Mismatch
**Severity:** CRITICAL
**File:** `AU/blog.html` (line referencing article links)

The blog.html ARTICLES array generates links like:
```javascript
window.location.href = a.slug + '.html'
```
This resolves to `/AU/slug.html` (e.g., `/AU/allergy-test-paw-licking-diagnosis.html`).

**Actual file locations:** `/AU/blog/allergy-test-paw-licking-diagnosis.html`

- The links in the rendered blog listing point to non-existent URLs
- Users clicking articles from the blog listing get 404s
- The sitemap lists `/AU/slug.html` URLs (matching the broken links)
- Canonical tags on the actual blog articles say `/AU/slug.html` (also wrong — should be `/AU/blog/slug.html`)

**Impact:** All blog article pages have broken inbound links from the listing page. Google cannot discover these pages via crawl. Zero blog article pages are likely indexed.

**Fix Required — two options:**

**Option A (recommended):** Move blog article files from `/AU/blog/` to `/AU/`
- Move all 36 files from `AU/blog/*.html` to `AU/*.html`
- Update sitemap.xml URLs to match
- Canonical tags already say `/AU/slug.html` — no change needed

**Option B:** Fix links and canonicals to use `/AU/blog/slug.html`
- Change `blog.html` link generation to `window.location.href = '/blog/' + a.slug + '.html'`
- Update canonical tags in all 36 blog article files to `https://www.agedpawwell.com/AU/blog/slug.html`
- Update sitemap.xml to use `/AU/blog/slug.html` URLs

---

### P0-3: Sitemap Blog Article URLs Are Wrong
**Severity:** CRITICAL
**File:** `sitemap.xml`

The sitemap lists:
```xml
<loc>https://agedpawwell.com/AU/allergy-test-paw-licking-diagnosis.html</loc>
<loc>https://agedpawwell.com/AU/arthritis-18-months.html</loc>
...
```

But actual files are at `AU/blog/allergy-test-paw-licking-diagnosis.html`. These sitemap URLs point to non-existent pages.

**Impact:** Even if Google crawls these URLs, they'll 404. Blog articles are effectively invisible to Google.

**Fix Required:** Update sitemap.xml to use correct paths (see P0-2 fix above).

---

### P0-4: Homepage Hamburger Icon HTML Encoding Corruption
**Severity:** CRITICAL (render issue)
**File:** `AU/index.html`

```html
<button class="hamburger" onclick="toggleMenu()" aria-label="Toggle navigation menu">鈽?</button>
```

The hamburger icon character is rendered as `鈽?` (encoding corruption). Should be `☰` or a proper SVG/Unicode character.

**Impact:** Hamburger menu button is visually broken on mobile. Accessibility failure — the aria-label is present but the visible text is garbled.

**Fix:** Replace `鈽?` with `☰` or an SVG icon.

---

## 4. High Issues (P1) — Fix Within 1 Week

### P1-1: Missing Open Graph Tags on Blog Articles
**Severity:** HIGH
**Files:** All 36 files in `AU/blog/*.html`

None of the blog article pages have any Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`). They only have:
- `<title>` ✅
- `<meta name="description">` ✅
- `<meta name="robots">` ✅
- `<link rel="canonical">` ✅
- Twitter Card tags ✅
- Structured data ✅

**Impact:** When shared on social media (Facebook, LinkedIn, etc.), blog articles will show no preview image, no rich description, no proper title. Zero social SEO value.

**Fix:** Add to each blog article `<head>`:
```html
<meta property="og:title" content="[Page Title] | PawWell">
<meta property="og:description" content="[Meta description]">
<meta property="og:type" content="article">
<meta property="og:url" content="https://www.agedpawwell.com/AU/blog/[slug].html">
<meta property="og:image" content="https://www.agedpawwell.com/AU/_shared/assets/og-image.png">
<meta property="og:site_name" content="PawWell">
<meta property="og:locale" content="en_AU">
```

---

### P1-2: og:image Inconsistency — Wrong Path on Disease Pages
**Severity:** HIGH
**Files:** `AU/arthritis.html`, `AU/kidney.html`, `AU/heart.html`

Disease pages use:
```html
<meta property="og:image" content="https://www.agedpawwell.com/AU/_shared/og-default.jpg">
```

But the actual og-image file is at:
```
https://www.agedpawwell.com/AU/_shared/assets/og-image.png
```

The path `/_shared/og-default.jpg` does not exist (no `og-default.jpg` in the `_shared/` directory — only in `_shared/assets/`).

**Impact:** Facebook/LinkedIn social shares of disease pages show no preview image (broken link). The homepage, community, blog, and assessment pages correctly use `/_shared/assets/og-image.png`.

**Fix:** Change all three disease pages to:
```html
<meta property="og:image" content="https://www.agedpawwell.com/AU/_shared/assets/og-image.png">
```

---

### P1-3: Duplicate Meta Tag Declarations (Code Bloat)
**Severity:** HIGH
**Files:** `AU/community.html`, `AU/blog.html`, `AU/assessment.html`

These files contain the same meta blocks duplicated twice within the `<head>`. For example, `community.html` has:
```html
<meta property="og:type" content="article">          <!-- first occurrence -->
...
<meta property="og:type" content="article">          <!-- DUPLICATE -->
```

This bloats HTML, creates duplicate meta tag warnings in Google Search Console, and can cause unpredictable rendering behavior.

**Fix:** Deduplicate all `<meta>` tag declarations in the affected files.

---

### P1-4: Blog Articles Missing H1 Tags
**Severity:** HIGH
**File:** `AU/blog/*.html` (all 36 files)

Blog article pages use `<h1>` only in the schema structured data (`headline` field), not in the visible HTML. The visible page title uses a non-heading element or a different heading level.

**Impact:** Each page should have exactly one `<h1>` for SEO and accessibility. Missing `<h1>` signals thin content to Google.

**Fix:** Ensure each blog article has a single `<h1>` in the visible HTML content.

---

### P1-5: Community Page Schema URL Bug
**Severity:** HIGH
**File:** `AU/community.html`

The JSON-LD `ItemList` schema contains community post URLs with double `/AU/AU/` path:
```json
"url": "https://www.agedpawwell.com/AU/AU/old-mate-struggling-on-stairs.html"
```
Should be:
```json
"url": "https://www.agedpawwell.com/AU/blog/old-mate-struggling-on-stairs.html"
```

**Impact:** Invalid structured data. Google may ignore the schema or log validation errors in Search Console.

**Fix:** Update the `url` field in each `ListItem` to use the correct path (see P0-2 resolution).

---

## 5. Medium Issues (P2) — Fix Within 1 Month

### P2-1: Missing `<meta name="keywords">` on Homepage
**Severity:** MEDIUM
**File:** `AU/index.html`

Homepage has no keywords meta tag. Disease pages (arthritis, kidney, heart) all include relevant keywords. The homepage is the highest-authority page and should target primary keywords.

**Fix:** Add to homepage `<head>`:
```html
<meta name="keywords" content="senior dog health, dog arthritis, kidney disease dogs, heart disease dogs, AI health check dogs, senior dog care Australia">
```

---

### P2-2: Google Fonts Loading Strategy
**Severity:** MEDIUM
**Files:** `AU/arthritis.html`, `AU/kidney.html`, `AU/heart.html`, `AU/blog.html`

Font loading uses:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap">
```

The `preconnect` hints are good, but the `stylesheet` link itself is render-blocking. Fonts are loaded from an external CDN with a font-family of 'Fredoka'.

**Impact:** Font may cause slight FOUT (Flash of Unstyled Text) or render delay. Fredoka is a Google Font — well-supported and reliable.

**Fix (optional):** Add `rel="preload"` + `onload` swap pattern for non-blocking font load:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"></noscript>
```

---

### P2-3: Community Page Uses WebSite Schema Instead of ItemList
**Severity:** MEDIUM
**File:** `AU/community.html`

The community page has two JSON-LD blocks:
1. `WebSite` schema (incomplete)
2. `ItemList` schema (correct but has double `/AU/AU/` URL bug — see P1-5)

The `WebSite` schema on community.html is not the right type for a community page. `ItemList` is correct. Remove the `WebSite` block to avoid schema conflicts.

---

### P2-4: Assessment Page Has Two Breadcrumb Schemas
**Severity:** MEDIUM
**File:** `AU/assessment.html`

The assessment page contains:
1. A broken/partial JSON-LD script block (contains only a `validateEmailInput` function, not JSON)
2. A `BreadcrumbList` schema
3. A `WebPage` schema

The broken script block should be removed from the JSON-LD section.

---

### P2-5: Blog Articles Missing `<meta name="author">`
**Severity:** MEDIUM
**Files:** All 36 `AU/blog/*.html`

Blog articles use `DiscussionForumPosting` schema with `author` but don't have a `<meta name="author">` tag in `<head>`.

---

### P2-6: Homepage Schema Missing WebSite Type
**Severity:** MEDIUM
**File:** `AU/index.html`

Homepage has `Organization` schema in `<head>` and `WebSite` schema in `<body>`. The `WebSite` schema should be in `<head>` and should include a `SearchAction` for sitelinks in Google results.

**Fix:** Move `WebSite` schema to `<head>` and add `SearchAction`:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PawWell",
  "url": "https://www.agedpawwell.com/AU/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.agedpawwell.com/AU/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

### P2-7: No Image alt Text on Decorative Images
**Severity:** MEDIUM (Accessibility)
**Files:** Multiple

Some decorative images use `aria-hidden="true"` which is correct. But some `<img>` tags may not have descriptive `alt` text. The logo image has `alt="PawWell"` which is minimal — consider `alt="PawWell - Senior Dog Health Community"`.

---

## 6. Per-Page Audit Results

| Page | Title | Meta Desc | OG Image | Canonical | Robots | Structured Data | Alt Text | Score |
|---|---|---|---|---|---|---|---|---|
| `/AU/index.html` | ✅ Present, good length | ✅ Present, good | ✅ `assets/og-image.png` | ✅ `www.agedpawwell.com/AU/` | ✅ `index, follow` | ⚠️ WebSite in body, missing SearchAction | ✅ | **72/100** |
| `/AU/community.html` | ✅ Present | ✅ Present | ✅ `assets/og-image.png` | ✅ Correct | ✅ `index, follow` | ⚠️ Duplicate OG tags, WebSite+ItemList, double /AU/AU/ URLs | ✅ | **68/100** |
| `/AU/blog.html` | ✅ Present | ✅ Present | ✅ `assets/og-image.png` | ✅ Correct | ✅ `index, follow` | ⚠️ Duplicate OG tags, Blog+BlogPosting schema | ✅ | **70/100** |
| `/AU/arthritis.html` | ✅ Present, good | ✅ Present, good | ❌ `og-default.jpg` (404) | ✅ Correct | ✅ `index, follow` | ✅ BreadcrumbList+FAQPage+Article | ✅ | **78/100** |
| `/AU/kidney.html` | ✅ Present, good | ✅ Present, good | ❌ `og-default.jpg` (404) | ✅ Correct | ✅ `index, follow` | ✅ BreadcrumbList+FAQPage+Article | ✅ | **78/100** |
| `/AU/heart.html` | ✅ Present, good | ✅ Present, good | ❌ `og-default.jpg` (404) | ✅ Correct | ✅ `index, follow` | ✅ BreadcrumbList+FAQPage+Article | ✅ | **78/100** |
| `/AU/assessment.html` | ✅ Present | ✅ Present | ✅ `assets/og-image.png` | ✅ Correct | ✅ `index, follow` | ⚠️ Duplicate OG tags, broken JSON-LD block | ✅ | **72/100** |
| `/AU/blog/[slug].html` (×36) | ✅ Present | ✅ Present | ❌ **None** | ⚠️ Wrong path (see P0-2) | ✅ `index, follow` | ✅ BreadcrumbList+Article+DiscussionForumPosting | ✅ | **52/100** |

---

## 7. Recommended Action Plan

### Immediately (Today):
1. **[P0-4]** Fix homepage hamburger icon encoding corruption (`AU/index.html`) — replace `鈽?` with `☰`
2. **[P0-1]** Fix robots.txt sitemap directive: `Sitemap: https://www.agedpawwell.com/AU/sitemap.xml`
3. **[P0-1]** Fix sitemap.xml domain: replace all `agedpawwell.com` → `www.agedpawwell.com`

### This Week:
4. **[P0-2, P0-3, P1-5]** Resolve blog article URL path — choose Option A (move files) or Option B (fix paths). Update sitemap accordingly.
5. **[P1-2]** Fix og:image path on arthritis.html, kidney.html, heart.html: `/_shared/og-default.jpg` → `/_shared/assets/og-image.png`
6. **[P1-3]** Deduplicate meta tags in community.html, blog.html, assessment.html

### This Month:
7. **[P1-1]** Add Open Graph tags to all 36 blog article files
8. **[P1-4]** Add visible `<h1>` tags to all blog article pages
9. **[P2-6]** Add WebSite schema with SearchAction to homepage `<head>`
10. **[P2-5]** Add `<meta name="author">` to blog article `<head>` sections
11. **[P2-4]** Remove broken script block from assessment.html JSON-LD area
12. **[P2-3]** Remove duplicate WebSite schema from community.html
13. **[P2-1]** Add keywords meta tag to homepage

---

## 8. Already-Good Items ✅

These items do NOT need fixing:

- **robots.txt** — `Allow: /` is correct. No blocking directives on important pages.
- **Canonical tags** — Present and correct on all main pages (arthritis, kidney, heart, assessment, blog listing). Correctly use `https://www.agedpawwell.com/AU/...` with www.
- **Robots meta** — All important pages set `index, follow`. No accidental noindex blocks.
- **Structured data quality** — Disease pages (arthritis, kidney, heart) have excellent JSON-LD: BreadcrumbList + FAQPage + Article schemas, all valid.
- **BreadcrumbList schema** — Present on all major pages with correct hierarchy.
- **FAQPage schema** — arthritis.html, kidney.html, heart.html all have rich 5-question FAQPage schemas.
- **Viewport meta** — Present on all pages.
- **Font CDN reliability** — Google Fonts is a reliable, fast CDN. `preconnect` hints are correctly used.
- **ARIA accessibility** — Good use of `aria-label`, `role="banner"`, `role="main"`, `role="contentinfo"`, `aria-hidden` on decorative elements.
- **Keyboard accessibility** — `.pw-header` uses `:focus-visible` outline style.
- **CSS/JS asset availability** — `_shared/styles.css`, `_shared/nav.js`, `assets/logo.png`, `assets/og-image.png` all exist in the repo.
- **Supabase CDN** — `@supabase/supabase-js@2` from jsdelivr is a reliable CDN.
- **Responsive design** — Mobile breakpoints at 768px and 480px present in all CSS.
- **Non-blocking scripts** — All `<script>` tags use `defer` attribute.
- **Sitemap changefreq/priority** — Homepage gets 1.0, disease pages get 0.9, appropriate hierarchy.
- **Blog article schema** — DiscussionForumPosting schema with proper author, datePublished, interactionStatistic, and Comment blocks.
- **Assessment form** — Good UX with step-by-step flow, email validation, and symptom categorization.
- **No mixed content** — All resources use HTTPS.

---

## Appendix: File Reference Table

| Issue | File | Line/Location |
|---|---|---|
| P0-1 sitemap domain | `sitemap.xml` | All `<loc>` elements |
| P0-1 robots.txt path | `robots.txt` | Line 4 |
| P0-2 blog links | `AU/blog.html` | ARTICLES array, `renderCard()` function |
| P0-2 canonicals | `AU/blog/*.html` | `<link rel="canonical">` |
| P0-3 sitemap blog URLs | `sitemap.xml` | Lines with blog article entries |
| P0-4 hamburger icon | `AU/index.html` | Hamburger button element |
| P1-1 OG tags blog | `AU/blog/*.html` | `<head>` section (absent) |
| P1-2 og:image wrong path | `AU/arthritis.html`, `AU/kidney.html`, `AU/heart.html` | `<head>` og:image meta |
| P1-3 duplicate OG | `AU/community.html`, `AU/blog.html`, `AU/assessment.html` | Duplicated blocks in `<head>` |
| P1-4 missing H1 | `AU/blog/*.html` | `<body>` article content |
| P1-5 double AU/AU | `AU/community.html` | JSON-LD ItemList `url` fields |
| P2-1 no keywords | `AU/index.html` | `<head>` section |
| P2-3 WebSite on community | `AU/community.html` | JSON-LD block |
| P2-4 broken JSON-LD | `AU/assessment.html` | Script block after BreadcrumbList schema |
| P2-6 WebSite in body | `AU/index.html` | `<body>` section |
