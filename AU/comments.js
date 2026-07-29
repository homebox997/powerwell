(function () {
    'use strict';

    function articleSlug() {
        return decodeURIComponent(window.location.pathname.split('/').pop() || '')
            .replace(/\.html$/i, '')
            .trim();
    }

    function text(value) {
        return String(value == null ? '' : value);
    }

    function commentDate(value) {
        if (!value) return '';
        var date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function normaliseViewCount(value) {
        if (typeof value === 'number') return value;
        if (Array.isArray(value) && value.length) {
            var row = value[0];
            if (typeof row === 'number') return row;
            return Number(row.view_count || row.count || 0);
        }
        if (value && typeof value === 'object') return Number(value.view_count || value.count || 0);
        return Number(value || 0);
    }

    function normaliseComments(value) {
        if (Array.isArray(value)) return value;
        if (value && Array.isArray(value.comments)) return value.comments;
        return [];
    }

    function addStyles() {
        var style = document.createElement('style');
        style.textContent =
            '.pw-engagement{max-width:760px;margin:1.5rem auto;padding:1.4rem;background:#fff;border:1px solid #e0e0e0;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.08);font-family:Segoe UI,Tahoma,sans-serif}' +
            '.pw-engagement h2{margin:0 0 .35rem;color:#2c3e50;font-size:1.35rem}.pw-view-count{margin:0 0 1rem;color:#7a8a9a;font-size:.9rem}' +
            '.pw-comment-list{display:grid;gap:.8rem;margin-bottom:1.1rem}.pw-comment{padding:.9rem 1rem;background:#f4f6f9;border-radius:12px}' +
            '.pw-comment-head{display:flex;justify-content:space-between;gap:1rem;margin-bottom:.35rem}.pw-comment-author{font-weight:700;color:#2c3e50}.pw-comment-date{color:#7a8a9a;font-size:.78rem}' +
            '.pw-comment p{margin:0;white-space:pre-wrap;color:#526475}.pw-comment-empty{padding:1rem;text-align:center;color:#7a8a9a;background:#f4f6f9;border-radius:12px}' +
            '.pw-comment-form{display:grid;gap:.7rem}.pw-comment-form label{font-weight:600;color:#2c3e50}.pw-comment-form input,.pw-comment-form textarea{width:100%;padding:.75rem;border:1px solid #d7dde3;border-radius:10px;font:inherit}.pw-comment-form textarea{min-height:95px;resize:vertical}' +
            '.pw-comment-form button{justify-self:start;padding:.7rem 1.2rem;border:0;border-radius:24px;background:linear-gradient(135deg,#ff6b6b,#ff8e53);color:#fff;font-weight:700}.pw-comment-status{min-height:1.4em;margin:0;color:#526475;font-size:.88rem}' +
            '@media(max-width:820px){.pw-engagement{margin:1.25rem 14px}}';
        document.head.appendChild(style);
    }

    function buildSection() {
        var section = document.createElement('section');
        section.className = 'pw-engagement';
        section.setAttribute('aria-labelledby', 'pw-comments-title');
        section.innerHTML =
            '<h2 id="pw-comments-title">Comments</h2>' +
            '<p class="pw-view-count"><span data-pw-view-count>0</span> views &middot; <span data-pw-comment-count>0</span> comments</p>' +
            '<div class="pw-comment-list" aria-live="polite"><div class="pw-comment-empty">Loading comments...</div></div>' +
            '<form class="pw-comment-form">' +
            '<label>Your name <input name="author" maxlength="50" autocomplete="name" placeholder="Anonymous"></label>' +
            '<label>Share your experience <textarea name="content" maxlength="500" required></textarea></label>' +
            '<button type="submit">Post comment</button><p class="pw-comment-status" role="status"></p>' +
            '</form>';

        var article = document.querySelector('article');
        if (article && article.parentNode) article.insertAdjacentElement('afterend', section);
        else document.querySelector('main, body').appendChild(section);
        return section;
    }

    function renderComments(section, comments) {
        var list = section.querySelector('.pw-comment-list');
        list.innerHTML = '';
        section.querySelector('[data-pw-comment-count]').textContent = String(comments.length);

        if (!comments.length) {
            var empty = document.createElement('div');
            empty.className = 'pw-comment-empty';
            empty.textContent = 'No comments yet. Be the first to share your experience.';
            list.appendChild(empty);
            return;
        }

        comments.forEach(function (comment) {
            var item = document.createElement('div');
            var head = document.createElement('div');
            var author = document.createElement('span');
            var date = document.createElement('time');
            var body = document.createElement('p');
            item.className = 'pw-comment';
            head.className = 'pw-comment-head';
            author.className = 'pw-comment-author';
            date.className = 'pw-comment-date';
            author.textContent = text(comment.author || 'Anonymous');
            date.textContent = commentDate(comment.created_at);
            body.textContent = text(comment.content);
            head.appendChild(author);
            head.appendChild(date);
            item.appendChild(head);
            item.appendChild(body);
            list.appendChild(item);
        });
    }

    function init() {
        var api = window.PawWellSupabase;
        var slug = articleSlug();
        if (!api || !slug) return;

        addStyles();
        var section = buildSection();
        var status = section.querySelector('.pw-comment-status');

        Promise.all([
            api.rpc('inc_view_count', { p_slug: slug, p_ip: '' }).catch(function () { return 0; }),
            api.rpc('get_article_comments', { p_slug: slug }).catch(function () { return []; })
        ]).then(function (results) {
            section.querySelector('[data-pw-view-count]').textContent = String(normaliseViewCount(results[0]));
            renderComments(section, normaliseComments(results[1]));
        });

        section.querySelector('.pw-comment-form').addEventListener('submit', function (event) {
            event.preventDefault();
            var form = event.currentTarget;
            var author = form.elements.author.value.trim().slice(0, 50) || 'Anonymous';
            var content = form.elements.content.value.trim().slice(0, 500);
            if (!content) return;
            status.textContent = 'Posting...';

            api.insert('article_comments', {
                article_slug: slug,
                author: author,
                content: content,
                approved: true
            }).then(function (rows) {
                var comment = Array.isArray(rows) && rows[0] ? rows[0] : {
                    author: author,
                    content: content,
                    created_at: new Date().toISOString()
                };
                var current = Array.prototype.map.call(section.querySelectorAll('.pw-comment'), function (node) {
                    return {
                        author: node.querySelector('.pw-comment-author').textContent,
                        content: node.querySelector('p').textContent,
                        created_at: node.querySelector('time').dateTime || node.querySelector('time').textContent
                    };
                });
                current.push(comment);
                renderComments(section, current);
                form.reset();
                status.textContent = 'Thanks. Your comment has been posted.';
            }).catch(function () {
                status.textContent = 'Your comment could not be posted. Please try again later.';
            });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
