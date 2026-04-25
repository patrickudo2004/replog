import { getGoogleAuth } from './google-auth';
import { PassThrough } from 'stream';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Drive API Helper logic (for images)
 */

export async function getDriveClient() {
  const { google } = await import('googleapis');
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('GOOGLE_AUTH_FAILED: Missing credentials');
  return google.drive({ version: 'v3', auth: auth });
}

export async function uploadToDrive(buffer: Buffer, fileName: string, mimeType: string) {
  const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!FOLDER_ID) throw new Error('GOOGLE_DRIVE_FOLDER_ID is not defined in environment variables');

  console.log(`[Drive] Uploading ${fileName} (${buffer.length} bytes) to folder ${FOLDER_ID}`);

  const drive = await getDriveClient();

  // Use PassThrough stream - more reliable in serverless environments
  const stream = new PassThrough();
  stream.end(buffer);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: mimeType || 'image/jpeg',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    console.log(`[Drive] Upload success: ${response.data.id}`);

    // Make file publicly readable so it can be viewed from the sheet
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return {
      id: response.data.id,
      url: response.data.webViewLink,
    };
  } catch (err) {
    const error = err as { message?: string; response?: { data?: any } };
    console.error('[Drive] Upload failed:', error.message);
    if (error.response) {
      console.error('[Drive] API response:', JSON.stringify(error.response.data));
    }
    throw err;
  }
}
