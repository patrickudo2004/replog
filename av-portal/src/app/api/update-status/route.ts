import { NextRequest, NextResponse } from 'next/server';
import { updateItemStatus } from '@/lib/sheets';
import { uploadToDrive } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const type = formData.get('type') as 'LOG' | 'TICKET';
    const newStatus = formData.get('newStatus') as string;

    if (!id || !type || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData: any = {};

    if (type === 'LOG') {
      updateData.verifier = formData.get('verifier') as string;
      updateData.remark = formData.get('remark') as string;
    } else if (type === 'TICKET') {
      updateData.resolver = formData.get('resolver') as string;
      updateData.resNotes = formData.get('resNotes') as string;
      
      const file = formData.get('resImage') as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `RES_${updateData.resolver}_${new Date().getTime()}`;
        const driveFile = await uploadToDrive(buffer, fileName, file.type);
        updateData.resImage = driveFile.url || '';
      }
    }

    await updateItemStatus(type, id, newStatus, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Status Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
