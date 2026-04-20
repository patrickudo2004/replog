import { NextResponse } from 'next/server';
import { updateItemStatus } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const { id, type, newStatus } = await request.json();

    if (!id || !type || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await updateItemStatus(type, id, newStatus);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Status Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
