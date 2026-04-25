import { uploadToDrive } from './drive';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Image Upload via Google Drive API (Unified Service Account)
 */

export async function uploadToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string }> {
  try {
    console.log(`[Storage] Uploading ${fileName} to Google Drive...`);
    const result = await uploadToDrive(buffer, fileName, mimeType);
    
    if (!result.url) {
      throw new Error('Upload succeeded but no URL was returned');
    }

    console.log(`[Storage] Success: ${result.url}`);
    return { url: result.url };
  } catch (error: any) {
    console.error('[Storage] Critical Upload Failure:', error.message);
    throw new Error(`Drive Upload Failed: ${error.message}`);
  }
}
