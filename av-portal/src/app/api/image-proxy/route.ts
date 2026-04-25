import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

export const dynamic = 'force-dynamic';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Drive Image Proxy (Diagnostic Version)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('id');

  if (!fileId) return new NextResponse('Missing file ID', { status: 400 });

  console.log(`[ImageProxy] Request for ID: ${fileId}`);

  try {
    const drive = await getDriveClient();
    
    // FETCH 1: Try to get metadata first to verify existence
    try {
      const meta = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, owners, shared',
        supportsAllDrives: true
      });
      console.log(`[ImageProxy] Found file: ${meta.data.name} (${meta.data.mimeType})`);
    } catch (metaError: any) {
      console.error(`[ImageProxy] Metadata Check Failed: ${metaError.message}`);
    }

    // FETCH 2: The actual media stream
    const response = await drive.files.get(
      { 
        fileId: fileId, 
        alt: 'media',
        supportsAllDrives: true,
        acknowledgeAbuse: true
      },
      { responseType: 'stream' }
    );

    const stream = response.data as unknown as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error: any) {
    const msg = error.message || 'Unknown error';
    console.error(`[ImageProxy] Final Failure for ${fileId}:`, msg);
    
    // Return a transparent 1x1 pixel instead of a 404 to avoid "Broken Image" icons
    // if we want, but for now 404 is better for debugging.
    return new NextResponse(`Image Proxy Error: ${msg}`, { status: 404 });
  }
}
