// Related Articles for disease landing pages (Section 6).
// Reads window.BLOG_ARTICLES (AU/_shared/blog-data.js), filters by the
// landing page's disease (data-disease on #related-articles-grid), shows the
// 8 newest, links each card to the in-site blog post, and adds a View All link.
// Does NOT touch staff-entry.js, GA4, cookies, or any other module.
(function () {
    function render() {
        var grid = document.getElementById('related-articles-grid');
        if (!grid) return;
        var disease = grid.getAttribute('data-disease') || '';
        var all = (window.BLOG_ARTICLES || []).filter(function (a) {
            return a.category && a.category.toLowerCase() === disease.toLowerCase();
        });
        all.sort(function (a, b) {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });
        var top = all.slice(0, 8);
        if (!top.length) {
            grid.innerHTML = '<p class="related-empty">More articles coming soon.</p>';
            return;
        }
        var html = '';
        top.forEach(function (a) {
            var url = './blog/' + a.slug + '.html';
            var title = a.title || '';
            var excerpt = a.excerpt || '';
            var meta = a.date || '';
            if (a.readTime) meta += ' · ' + a.readTime;
            html += '<a class="related-card" href="' + url + '" aria-label="Read article: ' + title + '">';
            html += '<div class="related-card-body">';
            html += '<h3>' + title + '</h3>';
            if (excerpt) html += '<p class="related-card-excerpt">' + excerpt + '</p>';
            html += '<span class="meta">' + meta + '</span>';
            html += '</div></a>';
        });
        grid.innerHTML = html;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
