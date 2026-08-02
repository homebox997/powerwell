(function () {
  'use strict';

  var entries = {
    sa: { disease: 'arthritis', landingPage: '/AU/arthritis.html', campaign: 'arthritis_au' },
    sb: { disease: 'heart', landingPage: '/AU/heart.html', campaign: 'heart_au' },
    sc: { disease: 'kidney', landingPage: '/AU/kidney.html', campaign: 'kidney_au' }
  };

  function readCookie(name) {
    var prefix = name + '=';
    var items = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i].trim();
      if (item.indexOf(prefix) === 0) {
        try {
          return decodeURIComponent(item.slice(prefix.length));
        } catch (error) {
          return item.slice(prefix.length);
        }
      }
    }
    return '';
  }

  function clearPendingCookie(name) {
    var cookie = name + '=; Path=/; Max-Age=0; SameSite=Lax';
    if (window.location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
  }

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('staff_id');
  var entry = slug && Object.prototype.hasOwnProperty.call(entries, slug) ? entries[slug] : null;
  if (!entry) return;

  var pendingCookie = 'apw_entry_pending_' + slug;
  if (readCookie(pendingCookie) !== '1') return;

  var isValidEntry =
    window.location.pathname === entry.landingPage &&
    params.get('disease') === entry.disease &&
    params.get('utm_source') === 'staff_promotion' &&
    params.get('utm_medium') === 'employee_referral' &&
    params.get('utm_campaign') === entry.campaign &&
    params.get('utm_content') === slug;

  if (!isValidEntry || typeof window.gtag !== 'function') return;

  window.gtag('event', 'employee_landing_entry', {
    staff_id: slug,
    disease: entry.disease,
    landing_page: entry.landingPage,
    entry_slug: slug,
    utm_source: 'staff_promotion',
    utm_medium: 'employee_referral',
    utm_campaign: entry.campaign,
    utm_content: slug
  });

  clearPendingCookie(pendingCookie);
}());
