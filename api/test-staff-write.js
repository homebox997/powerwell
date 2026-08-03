const { google } = require('googleapis');

const STAFF_SHEET_ID = '1GouQ3np_tU93JHwUiPAvpReqUbw1hFZJb3JoJ_Tc6jw';
const STAFF_SHEET_TAB = 'StaffClicks';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const result = { steps: [] };
  try {
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    result.steps.push('env_key_present=' + (key ? 'yes' : 'NO'));
    if (!key) { res.status(200).send(JSON.stringify(result)); return; }

    let credentials;
    try {
      credentials = JSON.parse(key);
      result.steps.push('json_parse=ok');
      result.steps.push('sa_client_email=' + (credentials.client_email || 'unknown'));
    } catch (e) {
      result.steps.push('json_parse_ERROR=' + e.message);
      res.status(200).send(JSON.stringify(result)); return;
    }

    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    result.steps.push('auth_created=ok');
    const sheets = google.sheets({ version: 'v4', auth });
    result.steps.push('sheets_created=ok');

    const row = [new Date().toISOString(), 'TEST', 'test', 'test', '/AU/test', 'diag', 'diag'];
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: STAFF_SHEET_ID,
      range: `${STAFF_SHEET_TAB}!A:G`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    });
    result.steps.push('append_OK updatedCells=' + appendRes.data.updates.updatedCells);
    res.status(200).send(JSON.stringify(result));
  } catch (e) {
    result.steps.push('ERROR=' + e.message);
    if (e.response && e.response.data) result.steps.push('api_error=' + JSON.stringify(e.response.data).slice(0, 300));
    res.status(200).send(JSON.stringify(result));
  }
};
