import { NextRequest, NextResponse } from 'next/server';
import { uploadToStorage } from '@/lib/storage';
import { appendToSheet } from '@/lib/sheets';


export const dynamic = 'force-dynamic';
export const maxDuration = 60;


/**
 * Winners Chapel Manchester - AV Technical Portal
 * Unified API Route for Logs and Tickets
 */

export async function POST(req: NextRequest) {
  console.log('[Submit] POST Request received');
  console.log('[Submit] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
  try {
    const formData = await req.formData();
    console.log('[Submit] FormData parsed');
    const type = formData.get('type') as string;
    console.log('[Submit] Type:', type);

    if (type === 'LOG') {
      const worker = formData.get('worker') as string;
      const date = formData.get('date') as string;
      const category = formData.get('category') as string;
      const activityName = formData.get('activityName') as string;
      const notes = formData.get('implementationNotes') as string;
      const isUrgent = formData.get('isUrgent') === 'true';
      const file = formData.get('screenshot') as File | null;

      let screenshotUrl = '';
      if (file && file.size > 0) {
        console.log(`[Submit] Starting image upload...`);
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `logs/LOG_${worker}_${Date.now()}.jpg`;
        const result = await uploadToStorage(buffer, fileName, file.type || 'image/jpeg');
        screenshotUrl = result.url;
        console.log(`[Submit] Image upload finished: ${screenshotUrl}`);
      }

      const newId = `LOG-${new Date().getTime().toString().slice(-8)}`;
      
      console.log(`[Submit] Appending to ActivityLog...`);
      await appendToSheet('ActivityLog', [
        newId,
        new Date().toISOString(),
        date,
        worker,
        category,
        activityName,
        notes,
        screenshotUrl,
        "", 
        "", 
        "Pending",
        isUrgent
      ]);

      console.log(`[Submit] LOG Success: ${newId}`);
      return NextResponse.json({ success: true, id: newId });

    } else if (type === 'TICKET') {
      const reporter = formData.get('reporter') as string;
      const source = formData.get('source') as string;
      const category = formData.get('category') as string;
      const description = formData.get('description') as string;
      const isUrgent = formData.get('isUrgent') === 'true';
      
      console.log(`[Submit] Processing images for TICKET...`);
      const images: string[] = [];
      for (let i = 1; i <= 3; i++) {
        const file = formData.get(`image${i}`) as File | null;
        if (file && file.size > 0) {
          console.log(`[Submit] Uploading ticket image ${i}...`);
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `tickets/TKT_${reporter}_${i}_${Date.now()}.jpg`;
          const result = await uploadToStorage(buffer, fileName, file.type || 'image/jpeg');
          images.push(result.url);
          console.log(`[Submit] Ticket image ${i} uploaded`);
        } else {
          images.push("");
        }
      }

      const newId = `TKT-${new Date().getTime().toString().slice(-8)}`;
      
      console.log(`[Submit] Appending to IssueTickets...`);
      await appendToSheet('IssueTickets', [
        newId,
        new Date().toISOString(),
        reporter,
        source,
        category,
        description,
        images[0],
        images[1],
        images[2],
        isUrgent,
        "Pending"
      ]);

      console.log(`[Submit] TICKET Success: ${newId}`);
      return NextResponse.json({ success: true, id: newId });
    }

    return NextResponse.json({ error: 'Invalid submission type' }, { status: 400 });

  } catch (error: any) {
    console.error('[Submit] Critical Error:', error);
    // Log more properties if they exist
    if (error.response) {
      console.error('[Submit] Error Response:', error.response.status, error.response.data);
    }
    const message = error.message || 'Internal Server Error';
    return NextResponse.json({ 
      error: message,
      details: error.stack,
      raw: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }, { status: 500 });
  }
}
