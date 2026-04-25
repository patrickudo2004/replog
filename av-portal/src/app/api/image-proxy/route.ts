import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Drive Image Proxy (Universal Bypass Version)
 * 
 * Instead of using the Service Account (which is blocked by Org policy),
 * we fetch the public "uc?export=view" URL without a referrer.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('id');

  if (!fileId) return new NextResponse('Missing file ID', { status: 400 });

  console.log(`[ImageProxy] Public Bypass Request for ID: ${fileId}`);

  // The public URL format that allows direct image viewing
  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  try {
    const response = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        // Removing the referrer is the key to bypassing "Anti-Hotlinking"
        'Referer': '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // If Google returns HTML instead of an image, it means the file isn't actually public
    if (contentType?.includes('text/html')) {
      console.error(`[ImageProxy] Error: Google returned an HTML page (likely a permission error)`);
      return new NextResponse('Image is not public or requires login', { status: 403 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error: any) {
    console.error(`[ImageProxy] Final Failure for ${fileId}:`, error.message);
    return new NextResponse(`Image Proxy Error: ${error.message}`, { status: 404 });
  }
}
