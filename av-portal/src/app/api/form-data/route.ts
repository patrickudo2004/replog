import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSheetsClient } from '@/lib/sheets';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    if (!sheets || !SHEET_ID) {
      console.warn('Skipping sheet fetch due to missing credentials or SHEET_ID');
      return NextResponse.json({ names: [], activityCategories: [], ticketCategories: [] });
    }

    // Fetch Names from Directory and Categories from Settings
    // Directory: Name is in Column D (Index 3)
    // Settings: Activity Categories in Column A (Index 0), Ticket Categories in Column B (Index 1)
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: ['Directory!D2:D100', 'Settings!A2:B100'],
    });

    const names = response.data.valueRanges?.[0].values?.flat().filter(Boolean) || [];
    const settingsData = response.data.valueRanges?.[1].values || [];
    
    const activityCategories = settingsData.map(row => row[0]).filter(Boolean);
    const ticketCategories = settingsData.map(row => row[1]).filter(Boolean);

    return NextResponse.json({
      names,
      activityCategories,
      ticketCategories,
    });
  } catch (error: any) {
    console.error('Form Data Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
