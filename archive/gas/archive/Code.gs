/**
 * Winners Chapel Manchester - AV Technical Portal
 * Hybrid GAS Backend (Direct API v3 Version - Service Account Handshake)
 */

const CONFIG = {
  SPREADSHEET_ID: "1g2OrqI0kKSU7d8nF-ODKFJUt230lDnsrHYrifeniRzI",
  SCREENSHOT_FOLDER_ID: "1OiQNMJ9wCUlUUfFF1V5FdOG0JeiD07gE",
  UPLOAD_TOKEN: "wcm-av-upload-202",
  // YOUR SERVICE ACCOUNT EMAIL
  SERVICE_ACCOUNT: "first-project@studious-matrix-483021-p5.iam.gserviceaccount.com"
};

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { base64Data, fileName, mimeType, token } = params;

    if (token !== CONFIG.UPLOAD_TOKEN) {
      return createJsonResponse({ success: false, error: "Forbidden: Invalid Token" });
    }

    if (!base64Data) {
      return createJsonResponse({ success: false, error: "No image data provided" });
    }

    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType || 'image/jpeg', fileName);
    
    const fileMetadata = {
      name: fileName,
      parents: [CONFIG.SCREENSHOT_FOLDER_ID]
    };
    
    // 1. Create the file
    const file = Drive.Files.create(fileMetadata, blob, { fields: 'id' });
    
    // 2. EXPLICIT HANDSHAKE: Share specifically with the Service Account
    // This is what will fix the 404 error in the proxy!
    const saPermission = {
      role: 'reader',
      type: 'user',
      value: CONFIG.SERVICE_ACCOUNT
    };
    Drive.Permissions.create(saPermission, file.id);
    
    // 3. Keep public permission as backup
    const publicPermission = {
      role: 'reader',
      type: 'anyone'
    };
    Drive.Permissions.create(publicPermission, file.id);
    
    return createJsonResponse({
      success: true,
      url: "https://drive.google.com/uc?export=view&id=" + file.id
    });

  } catch (err) {
    console.error("Upload Error: " + err.toString());
    return createJsonResponse({ success: false, error: "GAS API Handshake Error: " + err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function
 */
function testSetup() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log("Connected to spreadsheet: " + ss.getName());
    return "Direct API v3 Setup is valid!";
  } catch (e) {
    console.error("Setup Error: " + e.toString());
    return "Error: " + e.toString();
  }
}
