/**
 * Winners Chapel Manchester - AV Technical Portal
 * Hybrid GAS Backend (Direct API v3 Version)
 */

const CONFIG = {
  SPREADSHEET_ID: "1g2OrqI0kKSU7d8nF-ODKFJUt230lDnsrHYrifeniRzI",
  SCREENSHOT_FOLDER_ID: "1OiQNMJ9wCUlUUfFF1V5FdOG0JeiD07gE",
  UPLOAD_TOKEN: "wcm-av-upload-202"
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

    // Direct Drive API v3 Upload
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType || 'image/jpeg', fileName);
    
    const fileMetadata = {
      name: fileName,
      parents: [CONFIG.SCREENSHOT_FOLDER_ID]
    };
    
    // CRITICAL: Must specify 'fields' to get the webViewLink back in v3
    const file = Drive.Files.create(fileMetadata, blob, {
      fields: 'id, webViewLink, webContentLink'
    });
    
    // Set public permissions
    const permission = {
      role: 'reader',
      type: 'anyone'
    };
    Drive.Permissions.create(permission, file.id);
    
    return createJsonResponse({
      success: true,
      url: file.webViewLink || file.webContentLink
    });

  } catch (err) {
    console.error("Upload Error: " + err.toString());
    return createJsonResponse({ success: false, error: "GAS API v3 Error: " + err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify access
 */
function testSetup() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log("Connected to spreadsheet: " + ss.getName());
    
    const files = Drive.Files.list({
      q: "'" + CONFIG.SCREENSHOT_FOLDER_ID + "' in parents",
      pageSize: 1,
      fields: 'files(id, name)'
    });
    console.log("Drive API v3 check: Success.");
    
    return "Direct API v3 Setup is valid!";
  } catch (e) {
    console.error("Setup Error: " + e.toString());
    return "Error: " + e.toString();
  }
}
