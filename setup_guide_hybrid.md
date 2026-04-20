# Setup Guide: AV Activity Portal (Hybrid Edition)

This guide walks you through setting up the modern **Next.js + Google Sheets + Google Drive** version of the portal.

## 1. Google Cloud Setup (The "Brain")

This version uses a **Service Account** to talk to your spreadsheet and drive securely.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project** named `AV Technical Portal`.
3.  Navigate to **APIs & Services > Library**. 
    - Search for and **Enable** the **Google Sheets API**.
    - Search for and **Enable** the **Google Drive API**.
4.  Navigate to **APIs & Services > Credentials**.
    - Click **Create Credentials > Service Account**.
    - Name it `av-portal-service`, and Grant it **Editor** role for the project.
5.  Once created, click on the Service Account email.
    - Go to the **Keys** tab -> **Add Key > Create New Key**.
    - Choose **JSON**. Safe this file; we will need its contents.
6.  **CRITICAL - Sharing Access**:
    - **Spreadsheet**: Open your Google Spreadsheet and click **Share**. Add the Service Account email as an **Editor**.
    - **Drive Folder**: Open the Google Drive folder where you want screenshots to be saved. Click **Share** and add the Service Account email as an **Editor**.

## 2. Environment Variables

Create a file named `.env.local` in your app directory with the following (we will generate this for you during setup):

```env
# Google Cloud Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## 3. Local Development

1.  In your terminal, navigate to the `av-portal` folder.
2.  Run `npm install`.
3.  Run `npm run dev`.
4.  Open `http://localhost:3000`.

## 4. Deployment (The "Home")

We recommend **Vercel** for hosting. It's free and optimized for Next.js.

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Import your repository into Vercel.
3.  Add the environment variables listed above in the Vercel Dashboard.
4.  Deploy!
