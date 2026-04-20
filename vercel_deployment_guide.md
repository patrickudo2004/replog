# Vercel Deployment Guide: AV Technical Portal

This guide provides step-by-step instructions for deploying the `av-portal` application to Vercel.

## 1. Prepare Your Repository
Ensure all your changes are pushed to GitHub. The project should have the following structure:
- Root: `replog/`
  - `av-portal/` (The Next.js application)
  - `gas/` (Google Apps Script - for reference)
  - `README.md`

## 2. Deployment on Vercel

1. **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and sign in.
2. **New Project**:
   - Click **"Add New"** > **"Project"**.
   - Import the `replog` repository from your GitHub.
3. **Configure the Project**:
   - **Framework Preset**: Select **Next.js**.
   - **Root Directory**: Set this to `av-portal`. (Click "Edit" next to Root Directory and select the `av-portal` folder).
4. **Environment Variables**:
   Expand the **"Environment Variables"** section and add the keys from your `.env.local`:
   
   | Key | Value |
   |-----|-------|
   | `GOOGLE_SHEET_ID` | (Your Sheet ID) |
   | `GOOGLE_DRIVE_FOLDER_ID` | (Your Folder ID) |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | (Your Service Account Email) |
   | `GOOGLE_PRIVATE_KEY` | (Your Private Key - including the BEGIN/END headers) |

   > [!IMPORTANT]
   > Make sure the `GOOGLE_PRIVATE_KEY` is pasted exactly as it appears in your `.env.local`. Vercel handles the `\n` characters correctly.

5. **Deploy**: Click **"Deploy"**.

## 3. Post-Deployment Checks
- **Build Status**: Vercel will run `npm run build`. Note that we have added build-time safety checks to ensure the build succeeds even if Google credentials aren't fully validated during the static analysis phase.
- **Preview**: Once the deployment finishes, open the provided Vercel URL and verify the dashboard loads (if the environment variables are set correctly).

## 4. Troubleshooting
- **API Errors**: If the dashboard shows 0 or empty logs, check the "Functions" tab in Vercel logs to see if there are any Google Authentication errors.
- **Service Account Permissions**: Ensure your service account email has **Editor** access to the Google Sheet and the Drive folder.

---
© 2026 Winners Chapel Manchester
