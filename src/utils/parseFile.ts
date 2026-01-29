// Parse .xlsx or .csv file, validate, and return participants/errors
import * as XLSX from 'xlsx';
import { Participant } from './storage';

export interface ParseResult {
  participants: Participant[];
  errors: { row: number; message: string }[];
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let data: any[] = [];
  if (ext === 'csv') {
    const text = await file.text();
    data = text.split(/\r?\n/).map(line => line.split(','));
  } else if (ext === 'xlsx') {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  } else {
    return { participants: [], errors: [{ row: 0, message: 'Unsupported file type' }] };
  }
  
  // Find the header row (N, Name) - it might not be the first row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (row && row.length >= 2) {
      const col0 = String(row[0] || '').trim().toLowerCase();
      const col1 = String(row[1] || '').trim().toLowerCase();
      if (col0 === 'n' && col1 === 'name') {
        headerRowIndex = i;
        break;
      }
    }
  }
  
  if (headerRowIndex === -1) {
    return { participants: [], errors: [{ row: 0, message: 'Could not find header row with columns: N, Name. Please ensure your file has these exact headers.' }] };
  }
  
  // Parse data starting after the header row
  const participants: Participant[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenN = new Set<number>();
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || (row.length === 0) || (row[0] === undefined && row[1] === undefined)) {
      // Skip empty rows
      continue;
    }
    const n = parseInt(row[0]);
    const name = (row[1] || '').trim();
    if (!row[0] || isNaN(n)) {
      errors.push({ row: i + 1, message: `N is required and must be integer (found: ${row[0]})` });
      continue;
    }
    if (seenN.has(n)) {
      errors.push({ row: i + 1, message: `Duplicate N: ${n}` });
      continue;
    }
    if (!name) {
      errors.push({ row: i + 1, message: `Name is required for N=${n}` });
      continue;
    }
    seenN.add(n);
    participants.push({ n, name });
  }
  return { participants, errors };
}
