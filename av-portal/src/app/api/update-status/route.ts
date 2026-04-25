import { NextRequest, NextResponse } from 'next/server';
import { updateItemStatus } from '@/lib/sheets';
import { uploadToStorage } from '@/lib/storage';

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

    const updateData: {
      verifier?: string;
      remark?: string;
      resolver?: string;
      resNotes?: string;
      resImage?: string;
    } = {};

    if (type === 'LOG') {
      updateData.verifier = formData.get('verifier') as string;
      updateData.remark = formData.get('remark') as string;
    } else if (type === 'TICKET') {
      updateData.resolver = formData.get('resolver') as string;
      updateData.resNotes = formData.get('resNotes') as string;
      
      const file = formData.get('resImage') as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `resolutions/RES_${updateData.resolver}_${Date.now()}.jpg`;
        const result = await uploadToStorage(buffer, fileName, file.type || 'image/jpeg');
        updateData.resImage = result.url;
      }
    }

    await updateItemStatus(type, id, newStatus, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Status Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
