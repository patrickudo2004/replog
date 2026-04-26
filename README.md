# ⛪ Winners Chapel Manchester - AV Technical Portal

A professional management suite for the Audio-Visual team at Winners Chapel Manchester. This portal streamlines the tracking of technical logs, equipment issues, and team performance.

![Portal UI](https://lh3.googleusercontent.com/d/1PnzuJKAgogeB4JMUPBLGEQZECTQk8BUh)

## 🚀 Features
- **Unified Activity Logs**: Track system startups, startups, and technical tasks.
- **Ticketing System**: Report and track equipment issues with photo evidence.
- **iPhone Optimized**: Automatic HEIC to JPEG conversion and image compression.
- **Leaderboard**: Gamified team participation tracking.
- **Secure Image Hosting**: Custom-built proxy for reliable Google Drive image previews.
- **Premium Design**: Dark-mode first, glassmorphic UI built with Next.js and Framer Motion.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Next.js API Routes (Serverless).
- **Storage**: Google Sheets (Database) & Google Drive (Images).
- **Bridge**: Google Apps Script (GAS) for high-quota image uploads.
- **Deployment**: Vercel & GitHub.

## 📁 Repository Structure
- `/av-portal`: The main Next.js web application.
- `/archive/gas`: Contains the Google Apps Script bridge code.
- `SETUP_GUIDE.md`: Comprehensive instructions for deploying to a new environment.

## ⚙️ Quick Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up environment variables (see `SETUP_GUIDE.md`).
4. Run locally: `npm run dev`.

## 🛡️ Security
This app uses a **Hybrid Authentication Model**. Sheet data is accessed via a Google Service Account, while image uploads are handled via an authorized Web App bridge to ensure personal storage quotas are used correctly.

---
*Created with ❤️ for WCM AV Team.*
