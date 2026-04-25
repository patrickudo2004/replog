/**
 * Winners Chapel Manchester - AV Technical Portal
 * Image Upload via GAS Web App (Hybrid Mode)
 */

export async function uploadToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string }> {
  const GAS_URL = process.env.GAS_UPLOAD_URL;
  const GAS_TOKEN = process.env.GAS_UPLOAD_TOKEN;

  if (!GAS_URL) {
    throw new Error('GAS_UPLOAD_URL is not configured');
  }

  const base64Data = buffer.toString('base64');

  console.log(`[Upload] Attempting GAS upload for ${fileName}...`);

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Adding a User-Agent often bypasses Google's "Unauthorized" bot-blocking
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({ base64Data, fileName, mimeType, token: GAS_TOKEN }),
      redirect: 'follow', // Crucial for GAS Web Apps
    });

    console.log(`[Upload] Status: ${response.status} ${response.statusText}`);

    const text = await response.text();
    
    // If Google returns an HTML page (like a login or error page), JSON.parse will fail
    if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html')) {
      console.error('[Upload] GAS returned HTML instead of JSON. This usually means the script is not set to "Anyone".');
      throw new Error('GAS returned an HTML error page. Check "Who has access" settings.');
    }

    const data = JSON.parse(text);

    if (!data.success) {
      console.error('[Upload] GAS Business Error:', data.error);
      throw new Error(data.error || 'GAS upload failed');
    }

    console.log(`[Upload] Success: ${data.url}`);
    return { url: data.url };

  } catch (error: any) {
    console.error('[Upload] Critical Failure:', error.message);
    throw new Error(`GAS Upload Failed: ${error.message}`);
  }
}
