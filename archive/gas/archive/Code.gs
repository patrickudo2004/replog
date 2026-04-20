/**
 * Winners Chapel Manchester - AV Technical Dept Portal
 * Backend Script (Code.gs)
 */

const CONFIG = {
  SPREADSHEET_ID: "1g2OrqI0kKSU7d8nF-ODKFJUt230lDnsrHYrifeniRzI", // To be filled by user
  SCREENSHOT_FOLDER_ID: "1OiQNMJ9wCUlUUfFF1V5FdOG0JeiD07gE", // To be filled by user
  SHEET_NAMES: {
    LOG: "ActivityLog",
    DIRECTORY: "Directory",
    SETTINGS: "Settings",
    TICKETS: "IssueTickets"
  }
};

/**
 * Serves the Web App
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('AV Activity Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Fetches all necessary data for the Dashboard
 */
function getDashboardData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // 1. Get Log Data
  const logSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOG);
  const logData = logSheet.getDataRange().getValues();
  const logHeaders = logData.shift();
  
  // 2. Get Ticket Data
  const ticketSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TICKETS);
  const ticketData = ticketSheet ? ticketSheet.getDataRange().getValues() : [];
  if (ticketData.length > 0) ticketData.shift(); // Remove headers

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

  let pendingCount = 0;
  let thisWeekCount = 0;
  let lastWeekCount = 0;
  let leaderboard = {};
  let unifiedFeed = [];

  // Process Logs
  logData.forEach(row => {
    const id = row[0];
    const timestamp = new Date(row[1]);
    const activityDate = new Date(row[2]);
    const worker = row[3];
    const category = row[4];
    const activityName = row[5];
    const status = row[10];
    const isUrgent = row[11] === true;

    if (status === "Pending") pendingCount++;
    if (activityDate >= oneWeekAgo) {
      thisWeekCount++;
    } else if (activityDate >= twoWeeksAgo && activityDate < oneWeekAgo) {
      lastWeekCount++;
    }

    if (status === "Confirmed" && activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear()) {
      leaderboard[worker] = (leaderboard[worker] || 0) + 1;
    }

    if (timestamp >= thirtyDaysAgo) {
      unifiedFeed.push({
        id: id,
        type: "LOG",
        status: status,
        title: activityName,
        user: worker,
        date: Utilities.formatDate(timestamp, "GMT+1", "dd MMM HH:mm"),
        timestamp: timestamp.getTime(),
        isUrgent: isUrgent,
        verifier: row[8] || ""
      });
    }
  });

  // Process Tickets
  let openTicketsCount = 0;
  ticketData.forEach(row => {
    const id = row[0];
    const timestamp = new Date(row[1]);
    const reporter = row[2];
    const category = row[4];
    const description = row[5];
    const isUrgent = row[9] === true;
    const status = row[10];

    if (status === "Pending") openTicketsCount++;

    if (timestamp >= thirtyDaysAgo) {
      unifiedFeed.push({
        id: id,
        type: "TICKET",
        status: status,
        title: category + ": " + (description.length > 30 ? description.substring(0, 30) + "..." : description),
        user: reporter,
        date: Utilities.formatDate(timestamp, "GMT+1", "dd MMM HH:mm"),
        timestamp: timestamp.getTime(),
        isUrgent: isUrgent,
        resolver: row[11] || ""
      });
    }
  });

  // Sort unified feed by timestamp descending
  unifiedFeed.sort((a, b) => b.timestamp - a.timestamp);

  // Sort Leaderboard
  const sortedLeaderboard = Object.entries(leaderboard)
    .sort(([,a],[,b]) => b-a)
    .slice(0, 3)
    .map(([name, count]) => ({name, count}));

  return {
    pendingCount,
    thisWeekCount,
    lastWeekCount,
    leaderboard: sortedLeaderboard,
    openTicketsCount,
    unifiedFeed: unifiedFeed.slice(0, 15),
    recentActivity: unifiedFeed.filter(i => i.type === "LOG"),
    activeTickets: unifiedFeed.filter(i => i.type === "TICKET" && i.status === "Pending")
  };
}

/**
 * Gets names for dropdowns
 */
function getFormData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const dirSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DIRECTORY);
  const setSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SETTINGS);
  
  const lastRowDir = dirSheet.getLastRow();
  const names = lastRowDir > 1 ? dirSheet.getRange(2, 4, lastRowDir - 1, 1).getValues().flat().filter(String) : [];
  
  const lastRowSet = setSheet.getLastRow();
  const categories = lastRowSet > 1 ? setSheet.getRange(2, 1, lastRowSet - 1, 1).getValues().flat().filter(String) : [];
  
  let ticketCategories = [];
  if (setSheet.getLastColumn() >= 2 && lastRowSet > 1) {
    ticketCategories = setSheet.getRange(2, 2, lastRowSet - 1, 1).getValues().flat().filter(String);
  }
  
  return { names, categories, ticketCategories };
}

/**
 * Logs a new activity
 */
function submitLog(formObject) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOG);
  
  let screenshotUrl = "";
  if (formObject.screenshot) {
    const folder = DriveApp.getFolderById(CONFIG.SCREENSHOT_FOLDER_ID);
    const contentType = formObject.screenshot.split(',')[0].split(':')[1].split(';')[0];
    const data = Utilities.base64Decode(formObject.screenshot.split(',')[1]);
    const fileName = `LOG_${formObject.worker}_${Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd_HHmm")}`;
    const blob = Utilities.newBlob(data, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    screenshotUrl = file.getUrl();
  }

  const newId = "LOG-" + Utilities.formatDate(new Date(), "GMT+1", "ssmmHHddMM");
  
  sheet.appendRow([
    newId,
    new Date(), // Timestamp
    formObject.date,
    formObject.worker,
    formObject.category,
    formObject.activityName,
    formObject.implementationNotes,
    screenshotUrl,
    "", // Verifier (Empty)
    "", // Verification Remark (Empty)
    "Pending",
    formObject.isUrgent === "true"
  ]);
  
  return "Success";
}

/**
 * Get single log for verification
 */
function getLogForVerification(id) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOG);
  const data = sheet.getDataRange().getValues();
  
  const row = data.find(r => r[0] === id);
  if (!row) throw new Error("Log not found");
  
  return {
    id: row[0],
    worker: row[3],
    activity: row[5],
    notes: row[6],
    imageUrl: row[7],
    isUrgent: row[11]
  };
}

/**
 * Submits verification
 */
function submitVerification(formObject) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOG);
  const data = sheet.getDataRange().getValues();
  
  const rowIndex = data.findIndex(r => r[0] === formObject.id);
  if (rowIndex === -1) throw new Error("Log not found");
  
  const actualRow = rowIndex + 1;
  const logData = data[rowIndex];
  
  // Peer-lock check
  if (logData[3] === formObject.verifier) {
    throw new Error("You cannot verify your own activity.");
  }
  
  sheet.getRange(actualRow, 9).setValue(formObject.verifier);
  sheet.getRange(actualRow, 10).setValue(formObject.remark);
  sheet.getRange(actualRow, 11).setValue("Confirmed");
  
  return "Success";
}

/**
 * Upload Base64 Image to Drive
 */
function uploadToDrive(base64Str, prefix, workerName) {
  if (!base64Str) return "";
  const folder = DriveApp.getFolderById(CONFIG.SCREENSHOT_FOLDER_ID);
  const contentType = base64Str.split(',')[0].split(':')[1].split(';')[0];
  const data = Utilities.base64Decode(base64Str.split(',')[1]);
  const fileName = `${prefix}_${workerName}_${Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd_HHmm")}`;
  const blob = Utilities.newBlob(data, contentType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

/**
 * Logs a new Ticket
 */
function submitTicket(formObject) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TICKETS);
  if (!sheet) throw new Error("IssueTickets sheet not found");

  const reporter = formObject.customReporter ? formObject.customReporter : formObject.reporter;
  
  const img1 = uploadToDrive(formObject.image1, "TKT1", reporter);
  const img2 = uploadToDrive(formObject.image2, "TKT2", reporter);
  const img3 = uploadToDrive(formObject.image3, "TKT3", reporter);

  const newId = "TKT-" + Utilities.formatDate(new Date(), "GMT+1", "HHmmssddMM");
  
  sheet.appendRow([
    newId,
    new Date(), // Timestamp
    reporter,
    formObject.source || "Internal",
    formObject.category,
    formObject.description,
    img1,
    img2,
    img3,
    formObject.isUrgent === "true",
    "Pending", // Status
    "", // Resolver
    "", // ResNotes
    "", // ResImage
    ""  // ResTimestamp
  ]);
  
  return "Success";
}

/**
 * Get ticket details for resolution
 */
function getTicketForResolution(id) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TICKETS);
  const data = sheet.getDataRange().getValues();
  
  const row = data.find(r => r[0] === id);
  if (!row) throw new Error("Ticket not found");
  
  return {
    id: row[0],
    reporter: row[2],
    category: row[4],
    description: row[5],
    img1: row[6],
    img2: row[7],
    img3: row[8],
    isUrgent: row[9]
  };
}

/**
 * Resolve a ticket
 */
function resolveTicket(formObject) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TICKETS);
  const data = sheet.getDataRange().getValues();
  
  const rowIndex = data.findIndex(r => r[0] === formObject.id);
  if (rowIndex === -1) throw new Error("Ticket not found");
  
  const actualRow = rowIndex + 1;
  const resImg = uploadToDrive(formObject.resImage, "RES", formObject.resolver);
  
  sheet.getRange(actualRow, 11).setValue("Resolved");
  sheet.getRange(actualRow, 12).setValue(formObject.resolver);
  sheet.getRange(actualRow, 13).setValue(formObject.resNotes);
  sheet.getRange(actualRow, 14).setValue(resImg);
  sheet.getRange(actualRow, 15).setValue(new Date());
  
  return "Success";
}
