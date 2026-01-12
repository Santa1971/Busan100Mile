/**
 * Busan Galmaetgil 100M - Google Apps Script Backend
 * Deploy as Web App for API access
 */

// ============================================
// CONFIGURATION
// ============================================
const SPREADSHEET_ID = '1_aR99HL1KCYi6rZmCLCveGICiI4NgjcMpy2v0kLCfOw'; // Replace with actual ID
const SHEETS = {
  CONFIG: 'Config',
  NOTICES: 'Notices',
  CHECKPOINTS: 'Checkpoints',
  SCHEDULE: 'Schedule',
  REGISTRATIONS: 'Registrations',
  RESULTS: 'Results',
  CARPOOL: 'Carpool',
  CHEERS: 'Cheers',
  POSTS: 'Posts',
  ADMINS: 'Admins'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>\"\'&]/g, c => ({
    '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'
  }[c]));
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function computeHash(input) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

// ============================================
// GET HANDLERS
// ============================================
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case 'getConfig':
        return getConfig();
      case 'getNotices':
        return getNotices();
      case 'getCheckpoints':
        return getCheckpoints();
      case 'getSchedule':
        return getSchedule();
      case 'getCarpool':
        return getCarpool();
      case 'getCheers':
        return getCheers();
      case 'checkStatus':
        return checkStatus(e.parameter.name, e.parameter.phone4);
      case 'getResult':
        return getResult(e.parameter.name, e.parameter.phone4);
      case 'getPosts':
        return getPosts();
      case 'getInitialData':
        return getInitialData();
      case 'getAdminData':
        return getAdminData(e.parameter.password);
      case 'setupAdmin':
        return setupAdmin(e.parameter.username, e.parameter.password);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getConfig() {
  const sheet = getSheet(SHEETS.CONFIG);
  const data = sheet.getDataRange().getValues();
  const config = {};
  data.slice(1).forEach(row => config[row[0]] = row[1]);
  return jsonResponse(config);
}

function getInitialData() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('initialData');

  if (cached) {
    return ContentService.createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Fetch all needed data
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Config
  const configData = ss.getSheetByName(SHEETS.CONFIG).getDataRange().getValues();
  const config = {};
  configData.slice(1).forEach(row => config[row[0]] = row[1]);

  // Notices
  const notices = sheetToJSON(ss.getSheetByName(SHEETS.NOTICES));

  // Schedule
  const schedule = sheetToJSON(ss.getSheetByName(SHEETS.SCHEDULE));

  // Checkpoints
  const checkpoints = sheetToJSON(ss.getSheetByName(SHEETS.CHECKPOINTS));

  const result = {
    config: config,
    notices: notices,
    schedule: schedule,
    checkpoints: checkpoints
  };

  const jsonString = JSON.stringify(result);
  cache.put('initialData', jsonString, 300); // Cache for 5 minutes

  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

function getNotices() {
  const data = sheetToJSON(getSheet(SHEETS.NOTICES));
  return jsonResponse(data);
}

function getCheckpoints() {
  const data = sheetToJSON(getSheet(SHEETS.CHECKPOINTS));
  return jsonResponse(data);
}

function getSchedule() {
  const data = sheetToJSON(getSheet(SHEETS.SCHEDULE));
  return jsonResponse(data);
}

function getCheers() {
  const sheet = getSheet(SHEETS.CHEERS);
  const data = sheet.getDataRange().getValues();
  // Skip header row, return only message column
  const cheers = data.slice(1).map(row => row[0]).filter(msg => msg && msg.trim());
  return jsonResponse(cheers);
}

function getCarpool() {
  const data = sheetToJSON(getSheet(SHEETS.CARPOOL));
  // Mask phone numbers for privacy
  const masked = data.map(item => ({
    ...item,
    contact: item.contact ? item.contact.replace(/(\d{3})-?\d{4}-?(\d{4})/, '$1-****-$2') : ''
  }));
  return jsonResponse(masked);
}

// Secure: Requires name + phone last 4 digits
function checkStatus(name, phone4) {
  if (!name || !phone4) {
    return jsonResponse({ error: 'Name and phone4 required' });
  }

  const data = sheetToJSON(getSheet(SHEETS.REGISTRATIONS));
  const match = data.find(r =>
    r.name === name && r.phone && r.phone.slice(-4) === phone4
  );

  if (match) {
    return jsonResponse({
      found: true,
      status: match.status || '신청완료',
      course: match.course,
      birth: match.birth,
      phone: match.phone,
      timestamp: match.timestamp
    });
  }
  return jsonResponse({ found: false });
}

// Secure: Requires name + phone last 4 digits
function getResult(name, phone4) {
  if (!name || !phone4) {
    return jsonResponse({ error: 'Name and phone4 required' });
  }

  const data = sheetToJSON(getSheet(SHEETS.RESULTS));
  const match = data.find(r =>
    r.name === name && String(r.phone_last4) === String(phone4)
  );

  if (match) {
    return jsonResponse({
      bib: match.bib,
      name: match.name,
      course: match.course,
      time: match.time,
      rank: match.rank
    });
  }
  return jsonResponse(null);
}

function getPosts() {
  const data = sheetToJSON(getSheet(SHEETS.POSTS));
  // Sort by id descending (newest first)
  data.sort((a, b) => b.id - a.id);
  return jsonResponse(data);
}

function getAdminData(password) {
  if (!password) {
    return jsonResponse({ error: 'Unauthorized' });
  }

  const adminsSheet = getSheet(SHEETS.ADMINS);
  if (!adminsSheet) {
    // If Admin sheet doesn't exist, fallback or fail safe
    return jsonResponse({ error: 'Configuration Error' });
  }

  const data = adminsSheet.getDataRange().getValues();
  // Assume Row 1 is header: username, password_hash
  // Check against all rows starting from row 2
  const inputHash = computeHash(password);

  const authorized = data.slice(1).some(row => row[1] === inputHash);

  if (!authorized) {
    return jsonResponse({ error: 'Unauthorized' });
  }

  const registrations = sheetToJSON(getSheet(SHEETS.REGISTRATIONS));
  return jsonResponse({ registrations: registrations });
}

// ============================================
// POST HANDLERS
// ============================================
function doPost(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case 'register':
        return register(e);
      case 'submitCarpool':
        return submitCarpool(e);
      case 'deleteCarpool':
        return deleteCarpool(e);
      case 'submitPost':
        return submitPost(e);
      case 'cancelRegistration':
        return cancelRegistration(e);
      case 'updateStatus':
        return updateStatus(e);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function register(e) {
  const p = e.parameter;
  const sheet = getSheet(SHEETS.REGISTRATIONS);
  const data = sheet.getDataRange().getValues();

  // Check for duplicate registration (same name + phone)
  const existingRow = data.slice(1).findIndex(row =>
    row[1] === p.name && row[3] === p.phone && row[8] !== '취소'
  );

  if (existingRow !== -1) {
    return jsonResponse({
      success: false,
      error: '이미 신청된 정보입니다. 신청현황 조회에서 확인해주세요.',
      duplicate: true
    });
  }

  // Sanitize all inputs
  const row = [
    new Date(),
    sanitize(p.name),
    sanitize(p.birth),
    sanitize(p.phone),
    sanitize(p.course),
    sanitize(p.bloodType),
    sanitize(p.emergencyContact),
    sanitize(p.emergencyPhone),
    '신청완료'
  ];

  sheet.appendRow(row);
  return jsonResponse({ success: true, message: '참가 신청이 완료되었습니다.' });
}

function cancelRegistration(e) {
  const { name, phone4 } = e.parameter;
  if (!name || !phone4) {
    return jsonResponse({ success: false, error: '이름과 전화번호 뒷자리가 필요합니다.' });
  }

  const sheet = getSheet(SHEETS.REGISTRATIONS);
  const data = sheet.getDataRange().getValues();

  // Find the row (col 1 = name, col 3 = phone - match last 4 digits)
  for (let i = 1; i < data.length; i++) {
    const phone = data[i][3] || '';
    if (data[i][1] === name && phone.slice(-4) === phone4 && data[i][8] !== '취소') {
      // Update status to '취소' (column 9, index 8)
      sheet.getRange(i + 1, 9).setValue('취소');
      return jsonResponse({ success: true, message: '신청이 취소되었습니다.' });
    }
  }

  return jsonResponse({ success: false, error: '신청 내역을 찾을 수 없습니다.' });
}

function submitCarpool(e) {
  const p = e.parameter;
  const sheet = getSheet(SHEETS.CARPOOL);

  const row = [
    Date.now(),
    sanitize(p.type),
    sanitize(p.origin),
    sanitize(p.contact),
    sanitize(p.seats),
    sanitize(p.time),
    sanitize(p.password) // Hashed in production
  ];

  sheet.appendRow(row);
  return jsonResponse({ success: true });
}

function deleteCarpool(e) {
  const { id, password } = e.parameter;
  const sheet = getSheet(SHEETS.CARPOOL);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id) && data[i][6] === password) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, message: '비밀번호가 일치하지 않습니다.' });
}

function submitPost(e) {
  const p = e.parameter;
  const sheet = getSheet(SHEETS.POSTS);
  const data = sheet.getDataRange().getValues();
  const nextId = data.length > 1 ? Math.max(...data.slice(1).map(r => r[0] || 0)) + 1 : 1;

  const row = [
    nextId,
    sanitize(p.nickname),
    sanitize(p.title),
    sanitize(p.content),
    p.password,
    new Date().toISOString().split('T')[0],
    0  // views
  ];

  sheet.appendRow(row);
  return jsonResponse({ success: true, message: '글이 등록되었습니다.' });
}

function updateStatus(e) {
  const { name, phone, status } = e.parameter;
  const sheet = getSheet(SHEETS.REGISTRATIONS);
  const data = sheet.getDataRange().getValues();

  // The phone sent here is full phone number
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name && data[i][3] === phone) { // Name & Phone match
      sheet.getRange(i + 1, 9).setValue(status); // Update Status col (index 8, 1-based is 9)
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, error: 'Not found' });
}

function setupAdmin(username, password) {
  if (!username || !password) {
    return jsonResponse({ error: 'Username and password required' });
  }

  const sheet = getSheet(SHEETS.ADMINS);
  const data = sheet.getDataRange().getValues();
  const hash = computeHash(password);

  // Check if user exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      sheet.getRange(i + 1, 2).setValue(hash);
      return jsonResponse({ success: true, message: 'Password updated' });
    }
  }

  // Create new user
  sheet.appendRow([username, hash]);
  return jsonResponse({ success: true, message: 'Admin user created' });
}


// ============================================
// SETUP FUNCTION - Run once to create sheets
// ============================================
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetsConfig = {
    'Config': ['Key', 'Value'],
    'Notices': ['id', 'date', 'title', 'content', 'image_url'],
    'Checkpoints': ['id', 'name', 'km', 'cutoff', 'lat', 'lon'],
    'Schedule': ['id', 'time', 'title', 'location', 'icon'],
    'Registrations': ['timestamp', 'name', 'birth', 'phone', 'course', 'bloodType', 'emergencyContact', 'emergencyPhone', 'status'],
    'Results': ['bib', 'name', 'phone_last4', 'course', 'time', 'rank'],
    'Carpool': ['id', 'type', 'origin', 'contact', 'seats', 'time', 'password'],
    'Cheers': ['message', 'name', 'timestamp'],
    'Posts': ['id', 'nickname', 'title', 'content', 'password', 'date', 'views'],
    'Admins': ['username', 'password_hash']
  };

  for (const [name, headers] of Object.entries(sheetsConfig)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  Logger.log('Setup complete!');
}
