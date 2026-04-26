# ⛪ Winners Chapel Manchester - AV Technical Portal
## Complete Migration & Setup Guide

This guide provides step-by-step instructions for moving the Technical Portal to the official Church Google Account.

---

### 1. Google Drive & Sheets Setup
1.  **Create a Folder**: Log into the Church Gmail and create a folder named `AV Portal Assets` (or similar).
    *   **CRITICAL**: Right-click the folder -> **Share** -> Change "Restricted" to **"Anyone with the link"**.
    *   Copy the **Folder ID** from the URL (it’s the long string after `/folders/`).
2.  **Create the Spreadsheet**: Create a new Google Sheet named `AV Technical Log`.
    *   **Sheet 1 Name**: `ActivityLog`
    *   **Sheet 2 Name**: `IssueTickets`
    *   Copy the **Spreadsheet ID** from the URL (the string after `/d/`).
3.  **Headers**: Add these headers exactly (Row 1):
    *   **ActivityLog**: `ID`, `Timestamp`, `Date`, `Worker`, `Category`, `Activity Name`, `Notes`, `Screenshot`, `Verified By`, `Remarks`, `Status`, `Urgent`
    *   **IssueTickets**: `ID`, `Timestamp`, `Reporter`, `Source`, `Category`, `Description`, `Image 1`, `Image 2`, `Image 3`, `Urgent`, `Status`, `Resolved By`, `Resolution Notes`, `Proof Image`

---

### 2. Google Cloud & Service Account
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create Project**: Name it `WCM-AV-Portal`.
3.  **Enable APIs**: Search for and Enable:
    *   **Google Sheets API**
    *   **Google Drive API**
4.  **Create Service Account**:
    *   Go to **IAM & Admin > Service Accounts**.
    *   Click **Create Service Account**, name it `vercel-app`.
    *   Click **Done**.
5.  **Generate Key**:
    *   Click on the new Service Account -> **Keys** tab.
    *   **Add Key > Create New Key > JSON**.
    *   Save this file securely—you will need it for Vercel.
6.  **Final Step**: Copy the Service Account Email (e.g., `vercel-app@...iam.gserviceaccount.com`).
    *   **Go back to your Google Drive Folder and Sheet**.
    *   **Share** both of them with this Service Account email as **Editor**.

---

### 3. Google Apps Script (GAS) Setup
*The "Bridge" for image uploads.*

1.  Go to [script.google.com](https://script.google.com/).
2.  Create a **New Project** named `AV Portal Image Bridge`.
3.  **Code.gs**: Paste the code from `archive/gas/archive/Code.gs`.
    *   Update the `CONFIG` block with your new `SPREADSHEET_ID` and `SCREENSHOT_FOLDER_ID`.
4.  **Drive API Service**: 
    *   Left sidebar -> Click **"+" next to Services**.
    *   Find **Drive API** -> **Add**.
5.  **Manifest (appsscript.json)**:
    *   Project Settings (gear icon) -> Check **"Show 'appsscript.json' manifest file"**.
    *   Go back to Editor -> Open `appsscript.json`.
    *   Paste the manifest code from our previous setup.
6.  **Deploy**:
    *   **Deploy > New Deployment**.
    *   Type: **Web App**.
    *   Execute as: **Me** (The Church Account).
    *   Who has access: **Anyone**.
    *   Authorize the script when prompted.
7.  **Copy URL**: Copy the **Web App URL**. This is your `GAS_UPLOAD_URL`.

---

### 4. Vercel Environment Variables
Add these to your Vercel Project settings:

| Variable | Value |
| :--- | :--- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The Service Account Email |
| `GOOGLE_PRIVATE_KEY` | The `private_key` from your JSON file (include the `-----BEGIN...`) |
| `GOOGLE_SHEET_ID` | Your new Spreadsheet ID |
| `GOOGLE_DRIVE_FOLDER_ID` | Your new Folder ID |
| `GAS_UPLOAD_URL` | The URL from Step 3.7 |
| `GAS_UPLOAD_TOKEN` | `wcm-av-upload-202` (Must match Code.gs) |

---

### 5. Deployment
1.  Connect your GitHub repository to Vercel.
2.  Set the **Root Directory** to `av-portal`.
3.  Deploy.

---

### ✅ Checklist for Success
*   [ ] Folder is shared with "Anyone with link".
*   [ ] Service Account is an "Editor" on the Folder and Sheet.
*   [ ] Drive API is enabled in Google Cloud.
*   [ ] Drive API is added to GAS Services.
*   [ ] Private Key in Vercel is complete and starts with `-----BEGIN PRIVATE KEY-----`.
