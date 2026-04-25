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
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Get metadata to set correct content type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType,name'
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
    console.error('[ImageProxy] Error:', error.message);
    return new NextResponse('Image not found or unauthorized', { status: 404 });
  }
}
