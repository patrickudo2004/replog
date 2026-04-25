import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

export const dynamic = 'force-dynamic';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Drive Image Proxy
 * Bypasses Google's hotlinking restrictions by streaming the file server-side.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return new NextResponse('Missing file ID', { status: 400 });
  }

  try {
    const drive = await getDriveClient();
    
    // Fetch the file from Google Drive
    // supportsAllDrives: true ensures we can see files shared with us in folders
    // acknowledgeAbuse: true bypasses potential automated security flags
    const response = await drive.files.get(
      { 
        fileId: fileId, 
        alt: 'media',
        supportsAllDrives: true,
        acknowledgeAbuse: true
      },
      { responseType: 'stream' }
    );

    // Get metadata to set correct content type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType,name',
      supportsAllDrives: true
    });

    // Create a readable stream from the response
    const stream = response.data as unknown as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': metadata.data.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Disposition': `inline; filename="${metadata.data.name}"`,
      },
    });

  } catch (error: any) {
    console.error(`[ImageProxy] Error for ID ${fileId}:`, error.message);
    if (error.response) {
      console.error(`[ImageProxy] API Response:`, JSON.stringify(error.response.data));
    }
    return new NextResponse('Image not found or unauthorized', { status: 404 });
  }
}
