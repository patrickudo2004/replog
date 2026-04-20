import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDashboardStats } from '@/lib/sheets';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    if (!stats) return NextResponse.json({ pendingLogs: 0, openTickets: 0, feed: [] });
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Dashboard Data Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
