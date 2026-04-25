import { OAuth2Client, GoogleAuth } from 'google-auth-library';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Centralized Google Authentication using Service Account
 */

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

export async function getGoogleAuth(): Promise<any> {
  const { google } = await import('googleapis');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.error('CRITICAL: Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY) are missing from environment variables.');
    return null;
  }

  console.log(`[Auth] Email present: ${clientEmail.substring(0, 5)}...`);
  console.log(`[Auth] Key starts with: ${privateKey.substring(0, 20)}...`);

  // Handle newline characters and potential extra quotes from env variables
  const formattedPrivateKey = privateKey
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: formattedPrivateKey,
    },
    scopes: SCOPES,
  });

  return auth;
}
