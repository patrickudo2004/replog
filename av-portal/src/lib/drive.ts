import { google } from 'googleapis';
import { getGoogleAuth } from './google-auth';
import { Readable } from 'stream';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Drive API Helper logic (for images)
 */

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function getDriveClient() {
  const auth = await getGoogleAuth();
  return google.drive({ version: 'v3', auth: auth as any });
}

export async function uploadToDrive(buffer: Buffer, fileName: string, mimeType: string) {
  const drive = await getDriveClient();
  
  if (!FOLDER_ID) throw new Error('GOOGLE_DRIVE_FOLDER_ID is not defined');

  // Convert Buffer to Stream for the Drive API
  const stream = Readable.from(buffer);

  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  return {
    id: response.data.id,
    url: response.data.webViewLink,
  };
}
