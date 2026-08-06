const { google } = require('googleapis');
const fs = require('fs');

const SA_KEY = fs.readFileSync('D:/temp/google-auth/propane-purpose-502210-v9-2d292d3ac811.json', 'utf8');
const STAFF_SHEET_ID = '1GouQ3np_tU93JHwUiPAvpReqUbw1hFZJb3JoJ_Tc6jw';
const STAFF_SHEET_TAB = 'StaffClicks';

const entry = { staffId: 'sc', disease: 'kidney', landingPage: '/AU/kidney.html', campaign: 'kidney_au' };

(async () => {
  let credentials;
  try {
    credentials = JSON.parse(SA_KEY);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return;
  }
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });
  const row = [new Date().toISOString(), entry.staffId, entry.disease, entry.campaign, entry.landingPage, 'local-test', 'local-test'];
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: STAFF_SHEET_ID,
      range: STAFF_SHEET_TAB + '!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    });
    console.log('APPEND OK, updatedCells:', res.data.updates.updatedCells);
  } catch (e) {
    console.error('APPEND FAILED:', e.message);
    if (e.response && e.response.data) console.error(JSON.stringify(e.response.data).slice(0, 300));
  }
})();
