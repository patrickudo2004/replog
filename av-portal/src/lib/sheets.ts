import { google } from 'googleapis';
import { getGoogleAuth } from './google-auth';

/**
 * Winners Chapel Manchester - AV Technical Portal
 * Google Sheets API Helper logic
 */


export async function getSheetsClient() {
  const auth = await getGoogleAuth();
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

  // Fetch ActivityLog and IssueTickets
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges: ['ActivityLog!A2:L100', 'IssueTickets!A2:K100'],
  });

  const logs = response.data.valueRanges?.[0].values || [];
  const tickets = response.data.valueRanges?.[1].values || [];

  const pendingLogsCount = logs.filter(r => r[10] === 'Pending').length;
  const openTicketsCount = tickets.filter(r => r[10] === 'Pending').length;

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
