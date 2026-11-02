import { PilatesBooking } from '../types';
import { normalizeRawRow } from '../utils/parser';

export interface GoogleDriveSheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  rowCount?: number;
}

/**
 * Extracts the spreadsheet ID from a full Google Sheets URL or raw ID
 */
export function extractSpreadsheetId(input: string): string {
  const clean = input.trim();
  // Check for URL pattern: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return clean;
}

/**
 * Lists Google Sheets files accessible by the user from Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<GoogleDriveSheetFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=30`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Error ${res.status} al consultar Google Drive`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Error listing user spreadsheets:', error);
    throw error;
  }
}

/**
 * Fetches metadata of a Google Sheet to discover actual tab names (avoids hardcoding 'Sheet1')
 */
export async function fetchSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheets: SheetTabInfo[] }> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title,gridProperties.rowCount)`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Error ${res.status} al obtener detalles de la hoja de cálculo`);
    }

    const data = await res.json();
    const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount,
    }));

    return {
      title: data.properties?.title || 'Google Sheet',
      sheets,
    };
  } catch (error: any) {
    console.error('Error fetching spreadsheet metadata:', error);
    throw error;
  }
}

/**
 * Fetches all row values from a specific tab in a Google Sheet
 */
export async function fetchSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  tabName: string
): Promise<any[][]> {
  try {
    const range = encodeURIComponent(tabName);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Error ${res.status} al leer las filas de la hoja`);
    }

    const data = await res.json();
    return data.values || [];
  } catch (error: any) {
    console.error('Error fetching sheet values:', error);
    throw error;
  }
}

/**
 * Converts a 2D matrix (header row + data rows) from Google Sheets into PilatesBooking[]
 */
export function convertSheetDataToBookings(rows: any[][]): PilatesBooking[] {
  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((h: any) => String(h || '').trim());
  const bookings: PilatesBooking[] = [];

  for (let r = 1; r < rows.length; r++) {
    const rowValues = rows[r];
    if (!rowValues || rowValues.length === 0) continue;

    // Check if row has any non-empty cell
    const hasData = rowValues.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasData) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = rowValues[idx] !== undefined ? rowValues[idx] : '';
    });

    const booking = normalizeRawRow(rowObj, r - 1);
    bookings.push(booking);
  }

  return bookings;
}
