/**
 * Winners Chapel Manchester - AV Technical Portal
 * Image Upload via GAS Web App (runs as real Google user — uses Drive quota correctly)
 */

export async function uploadToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string }> {
  const GAS_URL = process.env.GAS_UPLOAD_URL;
  const GAS_TOKEN = process.env.GAS_UPLOAD_TOKEN;

  if (!GAS_URL) {
    throw new Error('GAS_UPLOAD_URL is not configured in environment variables');
  }

  console.log(`[Upload] Sending ${fileName} (${buffer.length} bytes) to GAS...`);

  const base64Data = buffer.toString('base64');

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, fileName, mimeType, token: GAS_TOKEN }),
    // GAS web apps do internal redirects — must follow them
    redirect: 'follow',
  });

  // GAS always returns 200 even for errors — check body
  const text = await response.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[Upload] GAS returned non-JSON:', text.slice(0, 500));
    throw new Error('GAS upload returned an unexpected response');
  }

  if (!data.success) {
    console.error('[Upload] GAS error:', data.error);
    throw new Error(data.error || 'GAS upload failed');
  }

  console.log(`[Upload] Success: ${data.url}`);
  return { url: data.url };
}
