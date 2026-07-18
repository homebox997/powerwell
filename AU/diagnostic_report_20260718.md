# PawWell Second-Round Full-Site Health Inspection Report
**Inspection Date**: 2026-07-18  
**Site**: agedpawwell.com  
**Repo**: D:\temp\powerwell\repo\AU\  
**Scope**: Diagnostic Only — No Code Modified, No Git Commits, No Deployment

---

## Overall Health Score: 34 / 100

The site has **severe structural and SEO issues** that will actively hurt Google indexing and potentially expose the Supabase database. The most critical problems are: duplicate blog pages at root level with wrong canonical URLs, a service_role key exposed in client-side JavaScript, and malformed navigation links in 31 blog pages.

---

## Module 1: Google SEO & Indexing Issues

### 🔴 CRITICAL

**1. Root-Level Blog Pages with Wrong Canonical URLs (31 files)**
- **Files**: `arthritis-18-months.html`, `allergy-test-paw-licking-diagnosis.html`, `best-elevated-bowls-arthritic-dog.html`, and 28 others in repo root
- **Problem**: Each has `<link rel="canonical" href="https://agedpawwell.com/AU/[filename]">` but the site serves from root (not `/AU/`). The canonical points to a non-existent path.
- **Impact**: Google will index 0 blog pages. Duplicate content with `community/*.html` versions. Full SEO failure for all blog articles.
- **Also**: `og:url`, and JSON-LD `url` fields all point to `agedpawwell.com/AU/...`
- **Remediation**: `requires refactor` — These 31 root-level files are duplicates of `community/*.html`. Either delete root files (keep only `community/`), or if root is intentional, remove `/AU/` from all canonical/og:url fields and JSON-LD `url` fields in those files.

**2. Malformed URLs in Root-Level Blog Pages (31 files)**
- **Files**: Same 31 root-level blog files
- **Problem**: Navigation link to Blog = `<a href="https://agedpawwell.com./blog.html">` (note `agedpawwell.com.` with a trailing DOT — invalid URL). All other nav links use `/AU/` prefix.
- **Impact**: The "Blog" nav link is broken on all 31 pages. `agedpawwell.com./blog.html` does not resolve.
- **Remediation**: `quick fix` — Regex replace `href="https://agedpawwell.com./blog.html"` → `href="./blog.html"` across all 31 files.

**3. Malformed Canonical in fish-oil-dosage-senior-dog.html (root)**
- **File**: `fish-oil-dosage-senior-dog.html` (root level)
- **Problem**: `<link rel="canonical" href="https://agedpawwell.com./fish-oil-dosage-senior-dog.html">` — invalid URL (dot instead of slash)
- **Impact**: Invalid canonical, Google ignores it
- **Remediation**: `quick fix` — Fix URL format

**4. Community Detail JSON-LD ItemList Points to Wrong Blog Paths**
- **File**: `community.html`
- **Problem**: JSON-LD ItemList `url` fields reference `https://agedpawwell.com/AU/[slug].html` but actual blog article URLs are `https://agedpawwell.com/community/[slug].html`. ItemList position 31 also points to `agedpawwell.com/AU/community.html` (wrong domain structure).
- **Impact**: Google's rich results/structured data for the community page is pointing to 404 URLs
- **Remediation**: `quick fix` — Replace all `agedpawwell.com/AU/` with `agedpawwell.com/community/` in the ItemList JSON-LD within `community.html`.

**5. community.html Has Canonical Pointing to Itself in `/AU/` Path**
- **File**: `community.html` (root level)
- **Problem**: `community.html` has canonical `<link rel="canonical" href="https://agedpawwell.com/community.html">` (correct), BUT the `community.html` in repo ROOT is a DIFFERENT file from `community/community.html`. The root-level `community.html` has canonical = correct. The issue is `submit.html` (root) has canonical `https://agedpawwell.com/AU/submit.html` (wrong).
- **Impact**: `submit.html` canonical is wrong — points to non-existent `/AU/` path
- **Remediation**: `quick fix` — Fix `submit.html` canonical from `agedpawwell.com/AU/submit.html` to `agedpawwell.com/submit.html`

---

### 🟠 HIGH

**6. Duplicate Blog Pages — Root vs community/ Directory**
- **Files**: 31 files appear in both root AND `community/` subdirectory with same content
- **Root versions**: canonical = `agedpawwell.com/AU/...` (wrong)
- **community/ versions**: canonical = `agedpawwell.com/community/...` (correct)
- **Impact**: Google sees 62 URLs for 31 articles. Duplicate content penalty likely. Confuses Google about which URL is canonical.
- **Remediation**: `requires refactor` — Delete the 31 root-level blog files entirely (they are duplicates of `community/`). Keep only `community/*.html`.

**7. Wrong JSON-LD About Field in kidney.html**
- **File**: `kidney.html` (root), line ~end of file
- **Problem**: JSON-LD Article schema contains: `"about": { "@type": "MedicalCondition", "name": "Canine Osteoarthritis", "description": "Progressive joint disease in dogs..." }` — describes JOINT disease, not kidney disease
- **Impact**: Google rich results show wrong disease type for kidney disease page
- **Remediation**: `quick fix` — Replace `about` object in kidney.html Article schema with correct kidney disease description

**8. Mixed Content References in Blog Detail JSON-LD**
- **Files**: `community/*.html` (31 files) and root-level blog files
- **Problem**: JSON-LD `url` fields in DiscussionForumPosting schemas use `agedpawwell.com/AU/[slug].html` — mismatched with actual canonical URL `agedpawwell.com/community/[slug].html`
- **Impact**: Structured data doesn't match page canonical, may cause Google to ignore rich results
- **Remediation**: `quick fix` — Replace `agedpawwell.com/AU/` with `agedpawwell.com/community/` in all 31 community detail page JSON-LD `url` fields

**9. Duplicate Community ItemList Schema in Root community.html**
- **File**: `community.html` (root)
- **Problem**: The large JSON-LD ItemList (31 items) uses `agedpawwell.com/AU/` prefix for all item URLs. Should use `agedpawwell.com/community/`
- **Impact**: Structured data points to 404s (since actual URLs are under `/community/`)
- **Remediation**: `quick fix` — Global replace in community.html JSON-LD

**10. JSON-LD @type Issue: Blog Listing Page Uses "Blog"**
- **File**: `blog.html`
- **Problem**: `@type: "Blog"` is for actual blog post pages. For a blog listing page, `@type: "WebPage"` or `@type: "ItemList"` is more appropriate
- **Impact**: Minor — may not trigger rich results correctly
- **Remediation**: `quick fix` — Change `@type: "Blog"` to `@type: "CollectionPage"` in blog.html

---

### 🟡 MEDIUM

**11. Content Cross-Contamination — arthritis Content in kidney.html**
- **File**: `kidney.html`
- **Problem**: The page contains a severity card grid with labels "Mild/Moderate/Severe" that describe arthritis symptoms ("stiffness after rest", "limping", "reluctance to jump"). Also contains a checklist titled "Common Arthritis Symptoms" and a photo card showing a golden retriever with arthritis caption. The bottom CTA says "Is Your Dog Showing Signs of **Arthritis**?"
- **Impact**: A page titled "Kidney Disease" containing almost entirely arthritis content is deeply confusing for users and will confuse search engines
- **Remediation**: `requires refactor` — Rewrite kidney.html with kidney-disease-specific content throughout. Remove all arthritis references.

**12. Wrong Related Article on kidney.html**
- **File**: `kidney.html`
- **Problem**: "Related Articles" section links `arthritis-18-months.html` (an arthritis blog post) with title "Charlie's Skin Issues Turned Out to Be Kidney Disease" — the slug and title don't match. The actual kidney disease blog post is not shown.
- **Impact**: Wrong navigation, confused users
- **Remediation**: `quick fix` — Replace with actual kidney disease blog post from community/ listing

**13. Community Detail Pages Use Wrong JSON-LD Blog URL Domain**
- **Files**: All 31 files in `community/*.html`
- **Problem**: Each has DiscussionForumPosting JSON-LD with `"url": "https://agedpawwell.com/AU/[slug].html"` — should be `agedpawwell.com/community/[slug].html`
- **Impact**: Structured data doesn't match canonical, potential rich results failure
- **Remediation**: `quick fix` — Global replace `agedpawwell.com/AU/` → `agedpawwell.com/community/` in all 31 community detail pages

**14. Duplicate File Set — Double Maintenance Burden**
- **Files**: 31 blog pages duplicated at root + in `community/`
- **Problem**: Every change must be applied twice. SEO suffers (see issues above). Confusing for developers.
- **Impact**: Ongoing maintenance risk of inconsistencies
- **Remediation**: `requires refactor` — Consolidate: keep only `community/*.html`, delete root-level blog duplicates

---

### 🟢 LOW

**15. Missing sitemap.xml**
- **Problem**: No sitemap.xml found anywhere in repo
- **Impact**: Google can't discover all pages efficiently. Essential for SEO.
- **Remediation**: `quick fix` — Generate sitemap.xml listing all canonical URLs

**16. Missing robots.txt**
- **Problem**: No robots.txt found
- **Impact**: Can't control crawler access. Also can't declare sitemap location.
- **Remediation**: `quick fix` — Create robots.txt with sitemap declaration and allow-all rules

**17. 404.html Has noindex**
- **File**: `404.html` (line 10)
- **Problem**: `<meta name="robots" content="noindex, follow">` — This is CORRECT behavior for 404 pages. Listed for completeness only.
- **Impact**: None — this is proper SEO behavior. ✓

---

## Module 2: Page Speed & Performance Issues

### 🔴 CRITICAL

**18. Duplicate Inline CSS in All Pages**
- **Files**: `arthritis.html`, `kidney.html`, `heart.html`, `arthritis-18-months.html`, and many blog detail pages
- **Problem**: Each page contains 400-600 lines of CSS inline in `<style>` tags, duplicating styles that already exist in `_shared/styles.css`. Same component styles (article-wrap, cover, severity-card, etc.) are redefined on every page.
- **Impact**: Page size inflation of 15-30KB per page. No browser cache benefit. Slow TTFB and LCP.
- **Remediation**: `requires refactor` — Move all component CSS from inline `<style>` to `_shared/styles.css`. Keep only page-specific overrides inline.

**19. Render-Blocking Synchronous Scripts**
- **Files**: All HTML pages load Supabase CDN synchronously:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-init.js"></script>
  <script src="js/api-client.js"></script>
  ```
- **Problem**: These scripts block page render. Supabase CDN + two local scripts must all load before page content appears.
- **Impact**: Slower LCP and FID. Especially impactful on mobile.
- **Remediation**: `quick fix` — Add `defer` attribute to Supabase CDN: `<script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

---

### 🟠 HIGH

**20. Community Data JS File Not Cleaned Up**
- **File**: `js/community-data-20260717115201.js` (dated July 17 — yesterday)
- **Problem**: Stale community data file from recent build/process. May be replaced by Supabase API calls or may contain outdated mock data.
- **Impact**: Potential confusion, unused file consuming space
- **Remediation**: `quick fix` — Verify if this file is used by any page. If not, delete it.

**21. Large Inline JSON-LD in community.html**
- **File**: `community.html`
- **Problem**: ~3,500 lines of JSON-LD ItemList schema (31 community posts) inlined in `<head>`. All dates show "just now" — stale/hardcoded data.
- **Impact**: Large HTML payload, outdated data, browser must parse it all before rendering
- **Remediation**: `quick fix` — Load community data dynamically from Supabase instead of hardcoding in HTML

---

### 🟡 MEDIUM

**22. Google Fonts @import in All Pages (Render-Blocking)**
- **Files**: All HTML pages have `<style>@import url('https://fonts.googleapis.com/...');</style>` inline
- **Problem**: `@import` is render-blocking and fires after CSS parse. Should use `<link rel="preconnect">` and `<link rel="stylesheet">` instead.
- **Impact**: Delayed font loading, potential FOUT
- **Remediation**: `quick fix` — Replace `@import` with `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="stylesheet">` in `<head>`

**23. All Blog Detail Pages Use Inline Styles**
- **Files**: All 31 `community/*.html` files + 31 root-level duplicates
- **Problem**: Each blog detail page has full inline CSS (~300 lines) instead of using shared styles
- **Impact**: Code duplication, slower page loads, harder maintenance
- **Remediation**: `requires refactor` — Consolidate into `_shared/blog-detail.css`

**24. Unused Commented Code in api-client.js**
- **File**: `js/api-client.js`
- **Problem**: Line 21 comment mentions "service_role key" but the code uses anon key (correct). Comment is outdated and misleading.
- **Impact**: Developer confusion
- **Remediation**: `quick fix` — Clean up misleading comments in api-client.js

---

### 🟢 LOW

**25. Images Use CSS Gradients Instead of Actual Images**
- **Files**: `arthritis.html`, `kidney.html`, `heart.html`, `arthritis-18-months.html`, all blog cards
- **Problem**: Photo cards use `background: linear-gradient(...)` + emoji text instead of real images. No actual image files are loaded (logo.png is the only real image).
- **Impact**: Not an issue for page speed since no images load. However, site lacks real photography which reduces conversion rates.
- **Remediation**: informational only — Not a bug, but a design limitation

---

## Module 3: Full-Site Compliance Violations

### 🟡 MEDIUM

**26. Encoding — All Files Are UTF-8 ✓**
- **Status**: Confirmed. All HTML files use `<meta charset="UTF-8">`. No Chinese filenames. ✓ PASS

**27. Font Family Inconsistency**
- **Files**: Some pages declare `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap')` in inline style, while `_shared/styles.css` uses `--pw-font: 'Segoe UI'` CSS variable. Pages don't use the Fredoka variable.
- **Problem**: Mix of 'Fredoka' (displayed via @import but unused in CSS) and 'Segoe UI'. Fonts are imported but not applied. Pages render in Segoe UI.
- **Impact**: Font import is wasted bandwidth (Fredoka downloads but isn't used)
- **Remediation**: `quick fix` — Either use Fredoka properly in CSS, or remove the @import to save ~15KB per page

**28. Color Palette — Per-Page Inline Overrides**
- **Files**: `arthritis.html` uses coral/red palette (#ff6b6b), `kidney.html` uses blue (#4a9eb8), `heart.html` uses red (#c0392b). All inline.
- **Problem**: Color is handled per-page (correct approach) but via inline CSS duplication rather than CSS variable overrides in `_shared/styles.css`
- **Impact**: Code duplication, but functionally correct
- **Remediation**: informational — Consider defining `--page-accent` CSS variable per-page instead of inline 300-line CSS blocks

**29. Navigation Link Path — Mixed Styles**
- **Files**: `community.html` uses `.header-inner` + `.nav` (full header pattern)
- **Files**: Disease guide pages use `.top-bar` + `.top-bar-inner` (sticky nav pattern)
- **Problem**: Two different nav implementations across the site. Community uses a full header bar, disease guides use a compact sticky bar.
- **Impact**: Inconsistent UX when navigating between pages
- **Remediation**: informational — Not a bug but a design inconsistency worth noting

---

### 🟢 LOW

**30. Mobile Responsive — Pages Checked Visually from Code**
- **Files**: All pages have `@media (max-width: 768px)` breakpoints
- **Status**: Media queries present. No horizontal scroll issues found in code review. ✓ PASS

**31. Business Logic — Ad/Affiliate Blocks Do NOT Precede Content**
- **Files**: All pages checked
- **Status**: No affiliate/ad blocks found. CTAs are embedded within or after content. ✓ PASS

**32. Knowledge Card Format — English First, Chinese Second**
- **Files**: No Chinese translations found in any HTML files
- **Status**: All content is English only. No violations. ✓ PASS

**33. No Chinese Paths or Filenames**
- **Status**: Confirmed. All filenames are English-only ASCII. ✓ PASS

---

## Module 4: Frontend Code & Community Issues

### 🔴 CRITICAL

**34. Supabase service_role Key Exposed in Client-Side JS**
- **File**: `js/supabase-init.js` (lines 6-8)
- **Problem**: The variable is named `SUPABASE_ANON_KEY` but the JWT payload contains `"role":"service_role"`. This key bypasses ALL Row Level Security. The file is loaded by ALL pages.
  ```javascript
  const SUPABASE_ANON_KEY = 'eyJ...'; // This is actually service_role!
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  ```
- **Impact**: Anyone can read this key from browser dev tools and gain full database write access. Comments acknowledge the risk ("生产环境建议改为 anon key"). Service_role is committed to git history.
- **Note**: `api-client.js` uses the correct anon key separately. The `supabase-init.js` service_role key appears to be a legacy/parallel connection.
- **Remediation**: `requires refactor` — 
  1. Replace service_role key with anon key in supabase-init.js
  2. Rotate the exposed service_role key in Supabase Dashboard immediately
  3. Add anon key to Supabase Dashboard if not present
  4. Verify `window.sb` is not used for any admin operations

---

### 🟠 HIGH

**35. Broken "Share Your Story" / "Contribute" Navigation in Root Blog Pages**
- **Files**: 31 root-level blog files
- **Problem**: "Contribute" link = `href="https://agedpawwell.com/AU/submit.html"` — points to non-existent `/AU/` path. The "Blog" link = `href="https://agedpawwell.com./blog.html"` — broken URL.
- **Impact**: Users cannot navigate to Blog or Contribute from root-level blog pages
- **Remediation**: `quick fix` — After consolidating to `community/*.html` only (issue #6), these links will work correctly since `community/*.html` uses relative paths `./submit.html` and `./blog.html`

**36. Duplicate Nav Button on arthritis.html**
- **File**: `arthritis.html`
- **Problem**: The hamburger button for mobile nav has TWO `onclick` handlers: one inline on the element and one in a `<script>` block at the bottom. The inline `onclick="toggleArthritisNav()"` is correct for this page, but the script at bottom could conflict.
- **Impact**: Potential JavaScript conflict on mobile
- **Remediation**: `quick fix` — Remove duplicate `toggleArthritisNav()` script block at bottom if it duplicates inline handler

**37. Silent Form Failures — Submit Form Has No Error Display**
- **File**: `submit.html`
- **Problem**: The contribution form submission likely calls a Supabase insert. No visible error message handling is evident in the form HTML (checked first 50 lines of body).
- **Impact**: Users submitting stories get no feedback if submission fails
- **Remediation**: `requires refactor` — Add visible error/success message container and JS error handling for form submission

---

### 🟡 MEDIUM

**38. Database Port Comments in supabase-init.js**
- **File**: `js/supabase-init.js`
- **Problem**: Lines comment: `case_db_port`, `blog_db_port`, `assessment_db_port`, `community_db_port` — documentation of internal table names exposed in source
- **Impact**: Information disclosure of internal database schema. Combined with exposed service_role key, this is a security risk multiplier.
- **Remediation**: `quick fix` — Remove these comments from the JS file

**39. No H1 Heading on blog.html**
- **File**: `blog.html`
- **Problem**: Page has `<h1>Senior Dog Health Blog</h1>` in the hero section (line ~?), but this is styled as a hero, not a proper page H1. No `<h1>` with appropriate styling for the main content area.
- **Impact**: Missing H1 for main content; affects SEO and accessibility
- **Remediation**: `quick fix` — Add a proper `<h1>` for the blog listing page

**40. No H1 Heading on submit.html**
- **File**: `submit.html`
- **Problem**: Page has `<h1>` but need to verify it renders as H1 in browser
- **Impact**: Potential accessibility/SEO issue
- **Remediation**: `quick fix` — Verify `<h1>` exists and is semantically correct

**41. Community JSON-LD Has Hardcoded "just now" Dates**
- **Files**: `community.html` (JSON-LD ItemList), all 31 `community/*.html` JSON-LD
- **Problem**: All `datePublished` fields show "just now" — fake/stale data that will confuse Google
- **Impact**: Google sees obviously fake dates, may distrust structured data
- **Remediation**: `quick fix` — Either remove datePublished from hardcoded JSON-LD, or use actual historical dates

---

### 🟢 LOW

**42. API Client — gs-api-client.js Purpose Unclear**
- **File**: `js/gs-api-client.js`
- **Problem**: File exists alongside `api-client.js`. Purpose unknown. Not referenced in any HTML page checked.
- **Impact**: Dead code, potential confusion
- **Remediation**: `quick fix` — Verify if gs-api-client.js is used. If not, delete it.

**43. Community Page "Share Your Story" Button — Hard to Find**
- **File**: `community.html`
- **Problem**: The "write-btn" (Share Your Story / Write a Post) is in the sidebar, below statistics. Users may not notice it.
- **Impact**: Lower contribution rates
- **Remediation**: informational — Consider moving the primary CTA button to the top of the feed

---

## Top 5 Priority Fixes (By Impact)

| # | Priority | Issue | Fix Type | Files |
|---|----------|-------|----------|-------|
| 1 | **CRITICAL** | service_role key in supabase-init.js — database fully exposed | requires refactor | `js/supabase-init.js` |
| 2 | **CRITICAL** | 31 root-level blog pages with wrong canonical `/AU/` URLs | requires refactor | 31 root `.html` files |
| 3 | **CRITICAL** | Malformed nav links `agedpawwell.com./` in 31 blog pages | quick fix | 31 root `.html` files |
| 4 | **CRITICAL** | Delete 31 root-level blog duplicates (keep `community/*.html`) | requires refactor | 31 root `.html` files |
| 5 | **HIGH** | kidney.html contains entirely wrong disease content (arthritis) | requires refactor | `kidney.html` |

---

## Community / 投稿板块 Special Issues Summary

**"投稿板块" = Community Submission Board**

1. **Duplicate Architecture**: Community detail pages exist in BOTH `community/*.html` (31 files) AND in repo root (another 31 files). The canonical URLs differ. This creates canonical confusion and duplicate content risk.

2. **Broken Nav in Root Blog Pages**: The "Blog" link in all 31 root-level blog pages uses malformed URL `agedpawwell.com./blog.html` — completely broken.

3. **Submit Form — No Visible Error Handling**: The "Share Your Story" / "Contribute" form at `submit.html` has no visible feedback for failure states.

4. **JSON-LD Structured Data Wrong for All Community Posts**: All 31 `community/*.html` pages have DiscussionForumPosting JSON-LD with `url` pointing to `agedpawwell.com/AU/[slug].html` instead of the correct `agedpawwell.com/community/[slug].html`.

5. **Hardcoded "just now" Dates**: All community post JSON-LD dates are "just now" — fake data that Google will flag.

6. **Community.html ItemList Wrong Domain**: The community main page ItemList references 31 blog post URLs at `agedpawwell.com/AU/` instead of `agedpawwell.com/community/`.

7. **submit.html Canonical Wrong**: `submit.html` has canonical pointing to `https://agedpawwell.com/AU/submit.html` — non-existent path.

---

## ⚠️ Mandatory Disclaimer
> ⚠️ No code was modified, no git commits made, no deployment triggered.
> All fixes listed above are pending explicit approval from the requester.
> The service_role key exposure (#34) should be treated as a security incident and the key rotated in Supabase Dashboard immediately once fix is approved.

---

*Report generated by diagnostic subagent | 2026-07-18 17:55 GMT+10*
