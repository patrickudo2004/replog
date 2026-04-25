import { DashboardStats } from '@/types';
import { getGoogleAuth } from './google-auth';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Sheets API Helper logic
 */

export async function getSheetsClient() {
  const { google } = await import('googleapis');
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('GOOGLE_AUTH_FAILED: Missing credentials');
  return google.sheets({ version: 'v4', auth: auth });
}

export async function appendToSheet(sheetName: string, values: (string | number | boolean)[]) {
  const sheets = await getSheetsClient();
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID is not defined');

  return await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sheets = await getSheetsClient();
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID is not defined');

  // Fetch ActivityLog and IssueTickets - Expanded range to 1000 rows
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges: ['ActivityLog!A2:L1000', 'IssueTickets!A2:O1000'],
  });

  const logs = response.data.valueRanges?.[0].values || [];
  const tickets = response.data.valueRanges?.[1].values || [];

  // Robust status counting: case-insensitive, trimmed, and null-safe
  const pendingLogsCount = logs.filter(r => 
    r[10]?.toString().trim().toLowerCase() === 'pending'
  ).length;

  const openTicketsCount = tickets.filter(r => 
    r[10]?.toString().trim().toLowerCase() === 'pending'
  ).length;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  const logsThisWeek = logs.filter(r => new Date(r[2]) >= oneWeekAgo).length;
  const activeMembers = new Set(logs.map(r => r[3]).filter(Boolean)).size;

  const leaderboardCounts: Record<string, number> = {};
  logs.forEach(r => {
    const activityDate = new Date(r[2]);
    const worker = r[3];
    const status = r[10]?.toString().trim();
    if (status === "Confirmed" && activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear() && worker) {
      leaderboardCounts[worker] = (leaderboardCounts[worker] || 0) + 1;
    }
  });

  const leaderboard = Object.entries(leaderboardCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Unified feed logic: combine logs and tickets, sort by timestamp
  const unifiedFeed: import('@/types').FeedItem[] = [
    ...logs.map(r => ({
      id: r[0],
      type: 'LOG' as const,
      title: r[5],
      user: r[3],
      timestamp: new Date(r[1]).getTime(),
      status: r[10],
      isUrgent: r[11] === 'TRUE',
      imageUrl: r[7], // Column H
    })),
    ...tickets.map(r => ({
      id: r[0],
      type: 'TICKET' as const,
      title: `${r[4]}: ${r[5]?.substring(0, 30)}...`,
      user: r[2],
      timestamp: new Date(r[1]).getTime(),
      status: r[10],
      isUrgent: r[9] === 'TRUE',
      imageUrl: r[6], // Column G (Image 1)
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  
  return {
    pendingLogs: pendingLogsCount,
    openTickets: openTicketsCount,
    logsThisWeek,
    activeMembers,
    leaderboard,
    feed: unifiedFeed
  };
}

export async function updateItemStatus(
  type: 'LOG' | 'TICKET', 
  id: string, 
  newStatus: string,
  updateData?: {
    verifier?: string;
    remark?: string;
    resolver?: string;
    resNotes?: string;
    resImage?: string;
  }
) {
  const sheets = await getSheetsClient();
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const sheetName = type === 'LOG' ? 'ActivityLog' : 'IssueTickets';
  
  // 1. Find the row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `${sheetName}!A2:A1000`, // Search only ID column
  });
  
  const values = response.data.values || [];
  const rowIndex = values.findIndex(row => row[0] === id);
  
  if (rowIndex === -1) throw new Error('Item not found');
  
  // 2. Update Columns based on type
  const actualRow = rowIndex + 2;

  if (type === 'LOG') {
    return await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID!,
      range: `${sheetName}!I${actualRow}:K${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updateData?.verifier || "", updateData?.remark || "", newStatus]],
      },
    });
  } else {
    // TICKET
    return await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID!,
      range: `${sheetName}!K${actualRow}:O${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus, updateData?.resolver || "", updateData?.resNotes || "", updateData?.resImage || "", new Date().toISOString()]],
      },
    });
  }
}
