/**
 * Winners Chapel Manchester - AV Technical Portal
 * Hybrid GAS Backend (Handles Image Uploads)
 * 
 * Instructions:
 * 1. Open your Google Apps Script editor.
 * 2. Paste this code.
 * 3. Set a secure token in CONFIG.UPLOAD_TOKEN.
 * 4. Deploy as "Web App".
 * 5. Set "Execute as: Me" and "Who has access: Anyone".
 * 6. Copy the Web App URL to your Vercel/Local env as GAS_UPLOAD_URL.
 */

const CONFIG = {
  SPREADSHEET_ID: "1g2OrqI0kKSU7d8nF-ODKFJUt230lDnsrHYrifeniRzI",
  SCREENSHOT_FOLDER_ID: "1OiQNMJ9wCUlUUfFF1V5FdOG0JeiD07gE",
  UPLOAD_TOKEN: "your_secret_token_here" // Must match GAS_UPLOAD_TOKEN in Vercel
};

/**
 * Handle POST requests from Next.js
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { base64Data, fileName, mimeType, token } = params;

    // Security check: Verify token
    if (token !== CONFIG.UPLOAD_TOKEN) {
      return createJsonResponse({ success: false, error: "Forbidden: Invalid Token" });
    }

    if (!base64Data) {
      return createJsonResponse({ success: false, error: "No image data provided" });
    }

    // Process image
    const folder = DriveApp.getFolderById(CONFIG.SCREENSHOT_FOLDER_ID);
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    
    const file = folder.createFile(blob);
    
    // Set sharing so images are viewable in the sheet
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return createJsonResponse({
      success: true,
      url: file.getUrl()
    });

  } catch (err) {
    return createJsonResponse({ success: false, error: "GAS Error: " + err.toString() });
  }
}

/**
 * Helper to create JSON response
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify folder and sheet access
 * Run this manually in the editor to check for permissions
 */
function testSetup() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.SCREENSHOT_FOLDER_ID);
    console.log("Connected to folder: " + folder.getName());
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log("Connected to spreadsheet: " + ss.getName());
    
    return "Setup is valid!";
  } catch (e) {
    console.error("Setup Error: " + e.toString());
    return "Error: " + e.toString();
  }
}
