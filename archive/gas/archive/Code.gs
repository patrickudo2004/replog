/**
 * Winners Chapel Manchester - AV Technical Portal
 * Hybrid GAS Backend (Direct API Version)
 * 
 * Instructions:
 * 1. Add "Drive API" to Services (Left Sidebar -> + -> Drive API -> Add).
 * 2. Paste this code.
 * 3. Deploy as "Web App" (Execute as: Me, Access: Anyone).
 */

const CONFIG = {
  SPREADSHEET_ID: "1g2OrqI0kKSU7d8nF-ODKFJUt230lDnsrHYrifeniRzI",
  SCREENSHOT_FOLDER_ID: "1OiQNMJ9wCUlUUfFF1V5FdOG0JeiD07gE",
  UPLOAD_TOKEN: "wcm-av-upload-202"
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

    // Direct Drive API Upload (Bypasses DriveApp security blocks)
    const resource = {
      title: fileName,
      mimeType: mimeType || 'image/jpeg',
      parents: [{ id: CONFIG.SCREENSHOT_FOLDER_ID }]
    };
    
    const mediaData = Utilities.base64Decode(base64Data);
    
    // Using Advanced Drive Service (Drive API v2)
    const file = Drive.Files.insert(resource, mediaData);
    
    // Set public permissions via API
    const permission = {
      role: 'reader',
      type: 'anyone'
    };
    Drive.Permissions.insert(permission, file.id);
    
    return createJsonResponse({
      success: true,
      url: file.alternateLink || file.webViewLink
    });

  } catch (err) {
    console.error("Upload Error: " + err.toString());
    return createJsonResponse({ success: false, error: "GAS API Error: " + err.toString() });
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
 * Test function to verify access
 */
function testSetup() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log("Connected to spreadsheet: " + ss.getName());
    
    // Check Drive API access by listing files in folder
    const files = Drive.Files.list({
      q: "'" + CONFIG.SCREENSHOT_FOLDER_ID + "' in parents and trashed = false",
      maxResults: 1
    });
    console.log("Drive API check: Success. Found " + (files.items ? files.items.length : 0) + " files.");
    
    return "Direct API Setup is valid!";
  } catch (e) {
    console.error("Setup Error: " + e.toString());
    return "Error: " + e.toString();
  }
}
