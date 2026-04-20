import { google } from 'googleapis';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Centralized Google Authentication using Service Account
 */

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

export async function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.warn('Google Service Account credentials are missing from environment variables.');
    return null;
  }

  // Handle newline characters in private key from env variables
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: formattedPrivateKey,
    },
    scopes: SCOPES,
  });

  return auth;
}
