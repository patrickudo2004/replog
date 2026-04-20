# Winners Chapel Manchester - AV Technical Portal

A high-performance, mobile-first Next.js application designed for the AV & IT subunit to log weekly activities and report technical issues. This portal synchronizes data in real-time with Google Sheets and Google Drive.

## 🚀 Key Features

- **Activity Logging**: Log weekly tasks with categories, implementation notes, and verifier remarks.
- **Issue Reporting**: Submit technical tickets with up to 3 image attachments and urgency tagging.
- **Unified Live Feed**: Real-time dashboard showing the latest activities and open tickets across the team.
- **HEIC Support**: Automatic conversion of iPhone (HEIC) images to JPEG for cross-platform compatibility.
- **Premium Design**: Modern, glassmorphism-inspired UI with smooth animations and dark mode support.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 20.9.0 or higher
- A Google Cloud Project with Sheets and Drive APIs enabled
- A Service Account with "Editor" access to your Google Sheet and Drive Folder

### 2. Environment Configuration
Create a `.env.local` file in the `av-portal` directory with the following keys:
```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here

# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Installation
```bash
cd av-portal
npm install
```

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

## 📖 Usage Guide

1. **Accessing the Portal**: Open the application on your mobile or desktop.
2. **Logging Activity**:
   - Tap "Log New Activity".
   - Select your name and activity category.
   - Enter task details and attach a screenshot (optional).
   - "Mark as Urgent" if the task requires immediate review.
3. **Reporting Issues**:
   - Tap "Report Issue".
   - Provide a source (area/room) and category.
   - Describe the problem and attach up to 3 evidence photos.
4. **Monitoring Progress**: Check the "Live Feed" on the dashboard for status updates (Pending/Reviewed).

---
Developed for Winners Chapel Manchester AV Team.
