import { google } from 'googleapis';
import { getGoogleAuth } from './google-auth';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Sheets API Helper logic
 */


export async function getSheetsClient() {
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('GOOGLE_AUTH_FAILED: Missing credentials');
  return google.sheets({ version: 'v4', auth: auth as any });
}

export async function appendToSheet(sheetName: string, values: any[]) {
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

export async function getDashboardStats() {
  const sheets = await getSheetsClient();
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID is not defined');

  // Fetch ActivityLog and IssueTickets - Expanded range to 1000 rows
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges: ['ActivityLog!A2:L1000', 'IssueTickets!A2:K1000'],
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

  // Unified feed logic: combine logs and tickets, sort by timestamp
  const unifiedFeed = [
    ...logs.map(r => ({
      id: r[0],
      type: 'LOG',
      title: r[5],
      user: r[3],
      timestamp: new Date(r[1]).getTime(),
      status: r[10],
      isUrgent: r[11] === 'TRUE',
    })),
    ...tickets.map(r => ({
      id: r[0],
      type: 'TICKET',
      title: `${r[4]}: ${r[5]?.substring(0, 30)}...`,
      user: r[2],
      timestamp: new Date(r[1]).getTime(),
      status: r[10],
      isUrgent: r[9] === 'TRUE',
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  
  return {
    pendingLogs: pendingLogsCount,
    openTickets: openTicketsCount,
    feed: unifiedFeed
  };
}

export async function updateItemStatus(type: 'LOG' | 'TICKET', id: string, newStatus: string) {
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
  
  // 2. Update Column K (Row index + 2 because sheet is 1-indexed and we started from A2)
  const actualRow = rowIndex + 2;
  const column = 'K';
  
  return await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID!,
    range: `${sheetName}!${column}${actualRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newStatus]],
    },
  });
}
