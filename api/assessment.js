/**
 * Vercel Serverless Function: POST /api/assessment
 * 
 * Security architecture:
 * - All sensitive operations run inside this serverless function
 * - GOOGLE_SERVICE_ACCOUNT_KEY: stored in Vercel env vars only (NEVER in frontend)
 * - RESEND_API_KEY: stored in Vercel env vars only (NEVER in frontend)
 * - Frontend only calls this endpoint, no direct third-party API access
 * 
 * Flow:
 * 1. Validate fields + bot check + duplicate check
 * 2. Write to Google Sheet (Service Account JWT auth)
 * 3. Calculate health results (server-side independent calculation)
 * 4. Send customer email via Resend
 * 5. Send owner notification email via Resend
 * 6. Return success + trigger GA4 conversion event
 */

const { google } = require('googleapis');
const crypto = require('crypto');

// ─── Configuration from Vercel Environment Variables ─────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'homebox997@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@agedpawwell.com';
const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;

// ─── CORS Headers ─────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// ─── Field Validation ─────────────────────────────────────────────────────────
const VALID_BREEDS = [
  'Cavoodle','Labrador','Golden Retriever','French Bulldog','German Shepherd',
  'Border Collie','Groodle','Mini Dachshund','Poodle','Cavalier King Charles',
  'Australian Kelpie','Staffy','Labradoodle','Spoodle','Chihuahua','Maltese'
];
const VALID_GENDERS = ['Male', 'Female'];
const VALID_SYMPTOMS = [
  'Stiff joints','Weak hind legs','Excessive thirst','Frequent nighttime urination',
  'Vision loss','Hearing loss','Dry coat','Poor appetite','Abnormally increased appetite',
  'Unexplained weight loss','Low stamina','Chronic cough','Resting rapid breathing',
  'Urinary or fecal incontinence','Cognitive confusion','Pale gums','Recurrent itching',
  'Frequent vomiting and loose stools'
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Symptom → Area mapping (server-side, matching frontend logic)
const JOINT_IDS = ['Stiff joints', 'Weak hind legs', 'Abnormally increased appetite'];
const KIDNEY_IDS = ['Excessive thirst', 'Frequent nighttime urination', 'Poor appetite', 'Unexplained weight loss', 'Urinary or fecal incontinence'];
const HEART_IDS = ['Resting rapid breathing', 'Chronic cough', 'Pale gums'];
const SKIN_IDS = ['Dry coat', 'Recurrent itching'];
const DIGEST_IDS = ['Frequent vomiting and loose stools'];
const NEURO_IDS = ['Vision loss', 'Hearing loss', 'Cognitive confusion'];

function validateFields(data) {
  const errors = [];

  if (!data.breed || !VALID_BREEDS.includes(data.breed)) {
    errors.push(`Invalid breed. Must be one of: ${VALID_BREEDS.join(', ')}`);
  }
  if (!data.gender || !VALID_GENDERS.includes(data.gender)) {
    errors.push('Invalid gender. Must be Male or Female.');
  }
  if (!Array.isArray(data.symptoms)) {
    errors.push('Symptoms must be an array.');
  } else {
    const invalidSymptoms = data.symptoms.filter(s => !VALID_SYMPTOMS.includes(s));
    if (invalidSymptoms.length > 0) {
      errors.push(`Invalid symptoms: ${invalidSymptoms.join(', ')}`);
    }
  }
  if (data.email && !EMAIL_REGEX.test(data.email)) {
    errors.push('Invalid email format.');
  }
  if (data.nickname && data.nickname.length > 100) {
    errors.push('Nickname too long (max 100 characters).');
  }
  return errors;
}

// ─── Bot Detection ────────────────────────────────────────────────────────────
function isBot(data, headers) {
  // Honeypot field (hidden in frontend, bots fill it)
  if (data._honeypot) return true;
  // User-Agent check
  const ua = headers['user-agent'] || '';
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) return true;
  // Suspiciously fast submission (< 3 seconds from page load - check X-Timestamp header)
  return false;
}

// ─── Duplicate Submission Check ───────────────────────────────────────────────
// Simple in-memory deduplication (Vercel serverless functions are stateless,
// so this only prevents rapid-fire duplicates within the same function instance)
// For production, use a Redis cache or Google Sheet check
const recentSubmissions = new Map(); // key: email hash, value: timestamp
const DUPLICATE_WINDOW_MS = 60 * 1000; // 60 seconds

function isDuplicate(email) {
  if (!email) return false; // No email = no deduplication check
  const key = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const last = recentSubmissions.get(key);
  if (last && Date.now() - last < DUPLICATE_WINDOW_MS) {
    return true;
  }
  recentSubmissions.set(key, Date.now());
  // Cleanup old entries
  if (recentSubmissions.size > 1000) {
    const cutoff = Date.now() - DUPLICATE_WINDOW_MS * 2;
    for (const [k, v] of recentSubmissions) {
      if (v < cutoff) recentSubmissions.delete(k);
    }
  }
  return false;
}

// ─── Health Result Calculation (server-side) ─────────────────────────────────
function calculateHealthResult(data) {
  const { breed, gender, symptoms, nickname } = data;
  const name = nickname || 'Your dog';

  // Count symptoms per area
  const j = symptoms.filter(s => JOINT_IDS.includes(s)).length;
  const k = symptoms.filter(s => KIDNEY_IDS.includes(s)).length;
  const h = symptoms.filter(s => HEART_IDS.includes(s)).length;
  const sk = symptoms.filter(s => SKIN_IDS.includes(s)).length;
  const d = symptoms.filter(s => DIGEST_IDS.includes(s)).length;
  const n = symptoms.filter(s => NEURO_IDS.includes(s)).length;

  const areas = [];
  const areaDetails = [];
  if (j > 0) { areas.push('Joint & Mobility'); areaDetails.push(`Joint & Mobility: ${j} symptom(s)`); }
  if (k > 0) { areas.push('Kidney & Urinary'); areaDetails.push(`Kidney & Urinary: ${k} symptom(s)`); }
  if (h > 0) { areas.push('Heart & Circulation'); areaDetails.push(`Heart & Circulation: ${h} symptom(s)`); }
  if (sk > 0) { areas.push('Skin & Coat'); areaDetails.push(`Skin & Coat: ${sk} symptom(s)`); }
  if (d > 0) { areas.push('Digestive'); areaDetails.push(`Digestive: ${d} symptom(s)`); }
  if (n > 0) { areas.push('Neuro & Sensory'); areaDetails.push(`Neuro & Sensory: ${n} symptom(s)`); }

  const count = symptoms.length;
  let urgency = 'Low';
  let timeframe = 'within 1-2 weeks';
  if (count == 0) urgency = 'None';
  else if (count <= 3) { urgency = 'Low'; timeframe = 'within 1-2 weeks'; }
  else if (count <= 8) { urgency = 'Moderate'; timeframe = 'within a week'; }
  else { urgency = 'High'; timeframe = 'ASAP — consider emergency vet'; }

  const summary = count == 0
    ? `${name} shows no significant symptoms at this time. Continue monitoring and maintain regular vet checkups.`
    : `${name} (${breed}, ${gender}) shows ${count} symptom(s) in: ${areas.join(', ')}. Urgency: ${urgency} — see a vet ${timeframe}.`;

  const recommendations = areas.length == 0
    ? ['Keep regular vet checkups', 'Maintain healthy diet & weight', 'Gentle daily exercise', 'Monitor for any changes']
    : [
        'Schedule a vet appointment as soon as possible',
        'Keep a daily symptom diary (note timing, triggers, severity)',
        'Monitor water intake & urine output',
        'Note changes in appetite, energy, and behavior',
        'Bring this report to your vet appointment',
        'Avoid self-medicating without vet guidance'
      ];

  return {
    areas,
    areaDetails,
    urgency,
    timeframe,
    summary,
    recommendations,
    symptomCount: count
  };
}

// ─── Google Sheets Write ──────────────────────────────────────────────────────
async function writeToGoogleSheet(data, healthResult) {
  if (!GOOGLE_SERVICE_ACCOUNT_KEY || !GOOGLE_SHEETS_ID) {
    console.warn('[assessment] Google Sheets not configured, skipping write');
    return null;
  }

  try {
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      data.nickname || '',
      data.email || '',
      data.breed,
      data.gender,
      healthResult.symptomCount,
      healthResult.areas.join(', '),
      data.symptoms.join(', '),
      healthResult.urgency,
      data.country || 'AU'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    });

    console.log('[assessment] Google Sheet write success');
    return timestamp;
  } catch (err) {
    console.error('[assessment] Google Sheet write error:', err.message);
    // Non-fatal: don't block the rest of the flow
    return null;
  }
}

// ─── Resend Email ─────────────────────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.warn('[assessment] Resend not configured, skipping email');
    return null;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[assessment] Resend error:', response.status, errBody);
      return null;
    }

    const result = await response.json();
    console.log('[assessment] Email sent:', result.id);
    return result.id;
  } catch (err) {
    console.error('[assessment] Resend fetch error:', err.message);
    return null;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────
function buildCustomerEmail(data, healthResult) {
  const { nickname, email, breed, gender } = data;
  const name = nickname || 'your dog';
  const areaList = healthResult.areaDetails.map(a => `<li>${a}</li>`).join('');
  const recList = healthResult.recommendations.map(r => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Dog's Health Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background: #f9f9f9;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 8px;">🐾</div>
      <h1 style="color: #ff8a4c; margin: 0 0 8px; font-size: 24px;">Your Dog's Health Report</h1>
      <p style="color: #888; margin: 0;">From AgedPawWell.com</p>
    </div>

    <div style="background: #fff7f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h2 style="color: #333; margin: 0 0 12px; font-size: 18px;">Hi${nickname ? `, ${name}` : ''}!</h2>
      <p style="margin: 0; color: #555; line-height: 1.6;">
        Based on your submission for <strong>${breed} (${gender})</strong>, here's what we found:
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="color: #333; font-size: 16px; border-bottom: 2px solid #ff8a4c; padding-bottom: 8px; margin: 0 0 16px;">📋 Detected Areas (${healthResult.symptomCount} total symptom${healthResult.symptomCount !== 1 ? 's' : ''})</h3>
      ${healthResult.symptomCount === 0 ? '<p style="color:#666;">No specific areas of concern detected.</p>' : ''}
      <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
        ${areaList}
      </ul>
    </div>

    <div style="background: ${healthResult.urgency === 'High' ? '#fff0f0' : healthResult.urgency === 'Moderate' ? '#fff8e0' : '#f0f9f0'}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px; font-size: 16px; color: #333;">⏱ Urgency Level: <strong style="color: ${healthResult.urgency === 'High' ? '#d32f2f' : healthResult.urgency === 'Moderate' ? '#f57c00' : '#388e3c'};">${healthResult.urgency}</strong></h3>
      <p style="margin: 0; color: #555;">${healthResult.summary}</p>
      <p style="margin: 8px 0 0; color: #d32f2f; font-weight: 600;">Recommended timeframe: See a vet ${healthResult.timeframe}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="color: #333; font-size: 16px; border-bottom: 2px solid #ff8a4c; padding-bottom: 8px; margin: 0 0 16px;">💡 Recommendations</h3>
      <ul style="color: #555; line-height: 2; padding-left: 20px; margin: 0;">
        ${recList}
      </ul>
    </div>

    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #666; line-height: 1.6;">
      <strong>⚠️ Disclaimer:</strong> This AI health assessment is for informational purposes only and is not a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian with any questions you may have regarding your pet's health condition. Results are based on general patterns and may not apply to your dog's specific situation. For veterinary emergencies in Australia, contact your local vet or the After Hours Veterinary Emergency: <strong>1300 302 912</strong>.
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://www.agedpawwell.com/AU/assessment.html" style="display: inline-block; background: #ff8a4c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Retake Assessment</a>
    </div>
  </div>
  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 16px;">
    © 2026 Aged Paw Well. All rights reserved.<br>
    <a href="https://www.agedpawwell.com/AU/privacy.html" style="color: #999;">Privacy Policy</a> · 
    <a href="https://www.agedpawwell.com/AU/disclaimer.html" style="color: #999;">Disclaimer</a>
  </p>
</body>
</html>`;
}

function buildOwnerEmail(data, healthResult) {
  const { nickname, email, breed, gender } = data;
  const timestamp = new Date().toLocaleString('Australia/Sydney', { timeZone: 'Australia/Sydney' });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New AI Health Check Submission</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 2px solid #ff8a4c; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px;">🐾</div>
      <h1 style="color: #ff8a4c; margin: 0;">New AI Health Check Submission</h1>
      <p style="color: #888; margin: 8px 0 0;">${timestamp} AEST</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 8px 0; color: #888; width: 140px;">Customer Email</td><td style="padding: 8px 0; font-weight: 600;">${email || '<em>Not provided</em>'}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Dog's Nickname</td><td style="padding: 8px 0;">${nickname || 'Not provided'}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Breed</td><td style="padding: 8px 0;">${breed}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Gender</td><td style="padding: 8px 0;">${gender}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Symptom Count</td><td style="padding: 8px 0; font-weight: 600;">${healthResult.symptomCount}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Detected Areas</td><td style="padding: 8px 0;">${healthResult.areas.join(', ') || 'None'}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Urgency</td><td style="padding: 8px 0; font-weight: 600; color: ${healthResult.urgency === 'High' ? '#d32f2f' : '#333'};">${healthResult.urgency}</td></tr>
    </table>

    <h3 style="margin: 0 0 12px; color: #333;">Symptoms Selected</h3>
    <p style="color: #555; margin: 0 0 16px;">${data.symptoms.length > 0 ? data.symptoms.join(', ') : 'None selected'}</p>

    <h3 style="margin: 0 0 12px; color: #333;">Summary</h3>
    <p style="color: #555; line-height: 1.6; margin: 0 0 16px;">${healthResult.summary}</p>

    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
      <h4 style="margin: 0 0 8px; color: #333;">Recommendations Sent to Customer</h4>
      <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
        ${healthResult.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(name, value);
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body
  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // ── Step 1: Validation ──────────────────────────────────────────────────────
  const validationErrors = validateFields(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationErrors
    });
  }

  // ── Step 2: Bot Check ───────────────────────────────────────────────────────
  const headers = req.headers || {};
  if (isBot(data, headers)) {
    console.warn('[assessment] Bot detected, rejecting submission');
    // Return success to bot to not reveal detection
    return res.status(200).json({ success: true, message: 'Report generated' });
  }

  // ── Step 3: Duplicate Check ─────────────────────────────────────────────────
  if (isDuplicate(data.email)) {
    return res.status(429).json({
      error: 'Duplicate submission',
      message: 'Please wait before submitting again.'
    });
  }

  // ── Step 4: Calculate Health Results (server-side) ──────────────────────────
  const healthResult = calculateHealthResult(data);

  // ── Step 5: Write to Google Sheet ──────────────────────────────────────────
  const sheetTimestamp = await writeToGoogleSheet(data, healthResult);

  // ── Step 6: Send Customer Email (if email provided) ─────────────────────────
  let customerEmailId = null;
  if (data.email) {
    const customerHtml = buildCustomerEmail(data, healthResult);
    customerEmailId = await sendEmail(
      data.email,
      `🐾 ${data.nickname || 'Your dog'}'s Health Report is Ready`,
      customerHtml
    );
  }

  // ── Step 7: Send Owner Notification Email ───────────────────────────────────
  const ownerHtml = buildOwnerEmail(data, healthResult);
  const ownerEmailId = await sendEmail(
    OWNER_EMAIL,
    `[PawWell] New AI Health Check — ${data.breed} (${data.email || 'No email'}) — ${healthResult.symptomCount} symptoms — Urgency: ${healthResult.urgency}`,
    ownerHtml
  );

  // ── Step 8: Return Success ──────────────────────────────────────────────────
  console.log('[assessment] Submission complete:', {
    email: data.email || 'no email',
    symptoms: data.symptoms.length,
    areas: healthResult.areas,
    urgency: healthResult.urgency,
    sheetWritten: !!sheetTimestamp,
    customerEmailSent: !!customerEmailId,
    ownerEmailSent: !!ownerEmailId
  });

  return res.status(200).json({
    success: true,
    message: 'Assessment submitted successfully',
    healthResult: {
      areas: healthResult.areas,
      urgency: healthResult.urgency,
      timeframe: healthResult.timeframe,
      summary: healthResult.summary
    },
    sheetWritten: !!sheetTimestamp,
    customerEmailSent: !!customerEmailId,
    ownerEmailSent: !!ownerEmailId
  });
};
