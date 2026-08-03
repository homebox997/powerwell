/**
 * Vercel Serverless Function: GET /go/:slug
 *
 * Whitelisted staff promotion redirects. The target URLs are fixed local
 * landing pages; request parameters can never change the redirect target.
 *
 * Each click is also logged to a Google Sheet (StaffClicks tab) for the
 * daily staff-traffic report. The Sheet write is non-blocking: it runs
 * after the 302 response is sent, so the redirect is never delayed.
 */

const { google } = require('googleapis');

const STAFF_ENTRIES = Object.freeze({
  sa: Object.freeze({
    staffId: 'sa',
    disease: 'arthritis',
    landingPage: '/AU/arthritis.html',
    campaign: 'arthritis_au'
  }),
  sb: Object.freeze({
    staffId: 'sb',
    disease: 'heart',
    landingPage: '/AU/heart.html',
    campaign: 'heart_au'
  }),
  sc: Object.freeze({
    staffId: 'sc',
    disease: 'kidney',
    landingPage: '/AU/kidney.html',
    campaign: 'kidney_au'
  })
});

// Google Sheet where staff clicks are recorded (StaffClicks tab).
// This is the Fuel_Card_Dataset spreadsheet; the Service Account already
// has write access. Not a secret — safe to reference as a constant.
const STAFF_SHEET_ID = '1GouQ3np_tU93JHwUiPAvpReqUbw1hFZJb3JoJ_Tc6jw';
const STAFF_SHEET_TAB = 'StaffClicks';

const SOURCE = 'staff_promotion';
const MEDIUM = 'employee_referral';
const SOURCE_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const ENTRY_COOKIE_MAX_AGE = 24 * 60 * 60;
const PENDING_COOKIE_MAX_AGE = 2 * 60;

function parseCookies(header) {
  return String(header || '').split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator < 0) return cookies;

    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (!name) return cookies;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch (error) {
      cookies[name] = value;
    }
    return cookies;
  }, Object.create(null));
}

function shouldUseSecureCookies(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  if (forwardedProto) return forwardedProto === 'https';

  const host = String(req.headers.host || '').toLowerCase();
  return !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function serializeCookie(name, value, maxAge, secure) {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax'
  ];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

function buildDestination(entry) {
  const destination = new URL(entry.landingPage, 'https://www.agedpawwell.com');
  destination.searchParams.set('utm_source', SOURCE);
  destination.searchParams.set('utm_medium', MEDIUM);
  destination.searchParams.set('utm_campaign', entry.campaign);
  destination.searchParams.set('utm_content', entry.staffId);
  destination.searchParams.set('staff_id', entry.staffId);
  destination.searchParams.set('disease', entry.disease);
  return `${destination.pathname}${destination.search}`;
}

/**
 * Non-blocking: append one click row to the StaffClicks tab.
 * Failures are logged but never thrown (must not affect the redirect).
 */
function logStaffClick(entry, req) {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.warn('[staff-click] GOOGLE_SERVICE_ACCOUNT_KEY not set, skip');
    return Promise.resolve();
  }

  let credentials;
  try {
    credentials = JSON.parse(key);
  } catch (e) {
    console.error('[staff-click] invalid SA key:', e.message);
    return Promise.resolve();
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    new Date().toISOString(),
    entry.staffId,
    entry.disease,
    entry.campaign,
    entry.landingPage,
    String(req.headers['user-agent'] || ''),
    String(req.headers.referer || '')
  ];

  return Promise.race([
    sheets.spreadsheets.values.append({
      spreadsheetId: STAFF_SHEET_ID,
      range: `${STAFF_SHEET_TAB}!A:G`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sheets API timeout')), 5000)
    )
  ])
    .then(() => console.log(`[staff-click] logged ${entry.staffId} -> ${entry.disease}`))
    .catch(err => console.error('[staff-click] write failed:', err.message));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Staff-Log-Version', 'v3-await-write');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
  const entry = typeof slug === 'string' && Object.prototype.hasOwnProperty.call(STAFF_ENTRIES, slug)
    ? STAFF_ENTRIES[slug]
    : null;

  if (!entry) {
    res.setHeader('Location', '/AU/404.html');
    return res.status(302).end();
  }

  const cookies = parseCookies(req.headers.cookie);
  const secure = shouldUseSecureCookies(req);
  const now = new Date().toISOString();
  const responseCookies = [];

  if (!cookies.apw_staff_first) {
    responseCookies.push(serializeCookie('apw_staff_first', entry.staffId, SOURCE_COOKIE_MAX_AGE, secure));
  }
  if (!cookies.apw_disease_first) {
    responseCookies.push(serializeCookie('apw_disease_first', entry.disease, SOURCE_COOKIE_MAX_AGE, secure));
  }
  if (!cookies.apw_staff_first_time) {
    responseCookies.push(serializeCookie('apw_staff_first_time', now, SOURCE_COOKIE_MAX_AGE, secure));
  }

  responseCookies.push(serializeCookie('apw_staff_last', entry.staffId, SOURCE_COOKIE_MAX_AGE, secure));
  responseCookies.push(serializeCookie('apw_disease_last', entry.disease, SOURCE_COOKIE_MAX_AGE, secure));
  responseCookies.push(serializeCookie('apw_staff_last_time', now, SOURCE_COOKIE_MAX_AGE, secure));

  const entryCookieName = `apw_entry_${entry.staffId}`;
  if (!cookies[entryCookieName]) {
    responseCookies.push(serializeCookie(entryCookieName, now, ENTRY_COOKIE_MAX_AGE, secure));
    responseCookies.push(serializeCookie(`apw_entry_pending_${entry.staffId}`, '1', PENDING_COOKIE_MAX_AGE, secure));
  }

  res.setHeader('Set-Cookie', responseCookies);
  res.setHeader('Location', buildDestination(entry));

  // Log the click BEFORE responding. Await with a hard timeout so a slow
  // or failing Sheets call can never delay or break the redirect.
  try {
    await Promise.race([
      logStaffClick(entry, req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('staff log timeout')), 5000))
    ]);
  } catch (e) {
    console.warn('[staff-click] skipped (timeout/error):', e.message);
  }

  res.status(302).end();
};

module.exports.STAFF_ENTRIES = STAFF_ENTRIES;
module.exports._test = { buildDestination, parseCookies, serializeCookie, shouldUseSecureCookies };
