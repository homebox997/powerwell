// PawWell client-side article stats & comments loader
// Fetches live view count + approved comments from Supabase and renders them.
// Works on all /AU/<article>.html pages that have data-dynamic markers.
(function () {
  'use strict';

  var SUPABASE_URL = 'https://cbbaejwbkenrutmgqikt.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE';

  function getSlug() {
    // Prefer data-slug from a data-dynamic element
    var el = document.querySelector('[data-dynamic="view-count"]');
    if (el && el.getAttribute('data-slug')) return el.getAttribute('data-slug');
    // Fallback: derive from pathname
    var p = window.location.pathname.replace(/^\/AU\//, '').replace(/\.html$/, '');
    return p;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setText(sel, val) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = val;
  }

  function rpc(name, body) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('RPC ' + name + ' failed: ' + r.status);
      return r.json();
    });
  }

  function renderComments(list, comments) {
    if (!list) return;
    list.innerHTML = '';
    if (!comments || !comments.length) {
      var empty = document.createElement('div');
      empty.className = 'comment-placeholder';
      empty.style.cssText = 'color:#888;text-align:center;padding:20px;';
      empty.textContent = 'No comments yet. Be the first to share!';
      list.appendChild(empty);
      return;
    }
    comments.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'comment-item';
      var date = (c.created_at || '').slice(0, 10);
      div.innerHTML =
        '<div class="comment-header"><span class="comment-author">' + esc(c.author || 'Anonymous') +
        '</span><time class="comment-time">' + esc(date) + '</time></div>' +
        '<p class="comment-text">' + esc(c.content || '') + '</p>';
      list.appendChild(div);
    });
  }

  function updateJsonLd(viewCount, commentCount, likeCount) {
    // Best-effort: update interactionStatistic in DiscussionForumPosting JSON-LD
    try {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        if (s.textContent.indexOf('DiscussionForumPosting') === -1) continue;
        var obj = JSON.parse(s.textContent);
        if (obj && obj.interactionStatistic) {
          obj.interactionStatistic.forEach(function (st) {
            if (st.interactionType === 'https://schema.org/WatchAction') st.userInteractionCount = String(viewCount);
            if (st.interactionType === 'https://schema.org/CommentAction') st.userInteractionCount = String(commentCount);
            if (st.interactionType === 'https://schema.org/LikeAction') st.userInteractionCount = String(likeCount);
          });
          s.textContent = JSON.stringify(obj);
        }
      }
    } catch (e) { /* ignore */ }
  }

  function init() {
    var slug = getSlug();
    if (!slug) return;

    var list = document.getElementById('comment-list');
    // Show loading state
    if (list) {
      list.innerHTML = '<div class="comment-placeholder" style="color:#888;text-align:center;padding:20px;">Loading comments...</div>';
    }

    var clientIP = '';
    try {
      clientIP = (window.__pw_ip || '');
    } catch (e) {}

    Promise.all([
      rpc('inc_view_count', { p_slug: slug, p_ip: clientIP }).catch(function () { return 0; }),
      rpc('get_article_comments', { p_slug: slug }).catch(function () { return []; })
    ]).then(function (res) {
      var views = res[0] || 0;
      var comments = Array.isArray(res[1]) ? res[1] : [];
      var commentCount = comments.length;
      var likes = 0;

      setText('[data-dynamic="view-count"]', views);
      setText('[data-dynamic="comment-count"]', commentCount);
      setText('[data-dynamic="like-count"]', likes);

      renderComments(list, comments);
      updateJsonLd(views, commentCount, likes);
    }).catch(function (err) {
      // On failure, leave placeholders at 0 and show empty comments
      if (list) {
        list.innerHTML = '<div class="comment-placeholder" style="color:#888;text-align:center;padding:20px;">Comments unavailable.</div>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
