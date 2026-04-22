import { NextRequest, NextResponse } from 'next/server';
import { uploadToDrive } from '@/lib/drive';
import { appendToSheet } from '@/lib/sheets';


export const dynamic = 'force-dynamic';


/**
 * Winners Chapel Manchester - AV Technical Portal
 * Unified API Route for Logs and Tickets
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string; // 'LOG' or 'TICKET'

    if (type === 'LOG') {
      const worker = formData.get('worker') as string;
      const date = formData.get('date') as string;
      const category = formData.get('category') as string;
      const activityName = formData.get('activityName') as string;
      const notes = formData.get('implementationNotes') as string;
      const isUrgent = formData.get('isUrgent') === 'true';
      const file = formData.get('screenshot') as File | null;

      let screenshotUrl = '';
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `LOG_${worker}_${new Date().getTime()}`;
        const driveFile = await uploadToDrive(buffer, fileName, file.type);
        screenshotUrl = driveFile.url || '';
      }

      const newId = `LOG-${new Date().getTime().toString().slice(-8)}`;
      
      // LOG headers: ID, Timestamp, ActivityDate, Worker, Category, Activity, Notes, URL, Verifier, Remark, Status, Urgent
      await appendToSheet('ActivityLog', [
        newId,
        new Date().toISOString(),
        date,
        worker,
        category,
        activityName,
        notes,
        screenshotUrl,
        "", // Verifier
        "", // Remark
        "Pending",
        isUrgent
      ]);

      return NextResponse.json({ success: true, id: newId });

    } else if (type === 'TICKET') {
      const reporter = formData.get('reporter') as string;
      const source = formData.get('source') as string;
      const category = formData.get('category') as string;
      const description = formData.get('description') as string;
      const isUrgent = formData.get('isUrgent') === 'true';
      
      // Handle multiple images (up to 3)
      const images: string[] = [];
      for (let i = 1; i <= 3; i++) {
        const file = formData.get(`image${i}`) as File | null;
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `TKT_${reporter}_${i}_${new Date().getTime()}`;
          const driveFile = await uploadToDrive(buffer, fileName, file.type);
          images.push(driveFile.url || '');
        } else {
          images.push("");
        }
      }

      const newId = `TKT-${new Date().getTime().toString().slice(-8)}`;
      
      // TICKET headers: ID, Timestamp, Reporter, Source, Category, Description, Img1, Img2, Img3, Urgent, Status
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

      return NextResponse.json({ success: true, id: newId });
    }

    return NextResponse.json({ error: 'Invalid submission type' }, { status: 400 });

  } catch (error: any) {
    console.error('Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
