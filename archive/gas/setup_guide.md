# Setup Guide: AV Activity Portal

Follow these steps to deploy your new Activity Log system.

---

### Step 1: Create the Google Sheet
1.  Create a new Google Sheet in your personal Google Drive.
2.  **Name the file:** `AV Activity Log` (or whatever you prefer).
3.  Create four tabs (sheets) at the bottom and name them exactly as follows:
    *   `ActivityLog`
    *   `Directory`
    *   `Settings`
    *   `IssueTickets`

---

### Step 2: Configure Columns & Data
In each tab, set up the headers in the first row (Row 1):

#### **Tab: `ActivityLog`**
| ID | Timestamp | Activity Date | Name | Category | Activity Name | Implementation Notes | Screenshot | Verifier | Verification Remark | Status | Urgent |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

#### **Tab: `Directory`**
| First Name | Middle Name | Last Name | Full Name (Formula) | Email | Phone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Example:* | John | B. | Doe | `=A2&" "&B2&" "&C2` | john@email.com | 123456 |
> [!TIP]
> Drag the "Full Name" formula down so it combines the names automatically. The app uses column D for names.

#### **Tab: `Settings`**
| Category List | Ticket Categories |
| :--- | :--- |
| Audio Sermon | Map Issue |
| Page | UI Bug |
| Announcement | Login Problem |
| Header | Other |
| Flyer | |
| Slider | |
> [!NOTE]
> **Category List (Col A)** is for Activity Logs. **Ticket Categories (Col B)** is for Issue Reporting.

#### **Tab: `IssueTickets`**
| ID | Timestamp | Reporter | Source | Category | Description | Image 1 | Image 2 | Image 3 | Urgent | Status | Resolver | Res Notes | Res Image | Res Timestamp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

---

### Step 3: Create Screenshot Folder
1.  In your Google Drive, create a new folder named `AV Screenshots`.
2.  Open the folder, and copy the **Folder ID** from the URL bar.
    *   *Example URL:* `drive.google.com/drive/u/0/folders/1abc123...`
    *   The Folder ID is `1abc123...`

---

### Step 4: Deploy the Script
1.  In your Google Sheet, go to **Extensions > Apps Script**.
2.  Delete all existing code in `Code.gs` and paste the content from my `Code.gs` file.
3.  Click the **(+)** icon next to "Files" and add a new **HTML** file named `index`.
4.  Paste the content from my `index.html` into that file.
5.  **Crucial Step:** In `Code.gs`, fill in your **SPREADSHEET_ID** and **SCREENSHOT_FOLDER_ID** in the `CONFIG` section at the top.
    *   *Spreadsheet ID* is in the sheet's URL: `spreadsheets/d/ID_HERE/edit`.
6.  Click **Deploy > New Deployment**.
7.  Select **Type: Web App**.
8.  Set **Execute as:** `Me`.
9.  Set **Who has access:** `Anyone`. (Don't worry, people still need your member list to log/verify).
10. Click **Deploy**, authorize permissions, and copy the **Web App URL**.

---

### Step 5: Start Loging!
Open the Web App URL on your phone or laptop. Pin it to your home screen for easy access!
