import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDashboardStats } from '@/lib/sheets';


export async function GET() {
  try {
    const stats = await getDashboardStats();
    if (!stats) return NextResponse.json({ pendingLogs: 0, openTickets: 0, logsThisWeek: 0, activeMembers: 0, leaderboard: [], feed: [] });
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard Data Error:', error);
    if (!process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json({ pendingLogs: 0, openTickets: 0, logsThisWeek: 0, activeMembers: 0, leaderboard: [], feed: [] });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
