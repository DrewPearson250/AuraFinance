import { Transaction, Investment } from '../types/finance';

/**
 * Parses CSV lines respecting double quotes
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Clean numeric string e.g. "$1,250.50", "(45.00)"
 */
export function cleanNumber(val: string): number {
  if (!val) return 0;
  let s = val.trim();
  const isParenNegative = s.startsWith('(') && s.endsWith(')');
  s = s.replace(/[\$,\s\(\)]/g, '');
  const num = parseFloat(s) || 0;
  return isParenNegative ? -Math.abs(num) : num;
}

/**
 * Imports transaction CSV with smart column mapping
 */
export function parseTransactionsCSV(csvText: string): { transactions: Transaction[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV file is empty or missing headers.'] };
  }

  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find indices
  const dateIdx = header.findIndex(h => h.includes('date'));
  const descIdx = header.findIndex(h => h.includes('desc') || h.includes('merchant') || h.includes('payee') || h.includes('name'));
  const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('total'));
  const debitIdx = header.findIndex(h => h.includes('debit') || h.includes('expense'));
  const creditIdx = header.findIndex(h => h.includes('credit') || h.includes('income'));
  const catIdx = header.findIndex(h => h.includes('cat') || h.includes('type'));

  if (dateIdx === -1 || descIdx === -1 || (amountIdx === -1 && debitIdx === -1 && creditIdx === -1)) {
    return {
      transactions: [],
      errors: ['Could not detect required columns. Please ensure Date, Description, and Amount columns exist.']
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const cols = parseCSVLine(rawLine);
    if (cols.length < 2) continue;

    const dateStr = cols[dateIdx] || new Date().toISOString().split('T')[0];
    const desc = cols[descIdx] || 'Unlabeled Transaction';
    
    let amount = 0;
    if (amountIdx !== -1 && cols[amountIdx] !== undefined) {
      amount = cleanNumber(cols[amountIdx]);
    } else {
      const debit = debitIdx !== -1 ? cleanNumber(cols[debitIdx] || '0') : 0;
      const credit = creditIdx !== -1 ? cleanNumber(cols[creditIdx] || '0') : 0;
      amount = credit > 0 ? credit : -Math.abs(debit);
    }

    const rawCat = catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim() : '';

    transactions.push({
      id: `imp-${Date.now()}-${i}`,
      date: dateStr,
      description: desc,
      amount: amount,
      category: rawCat || 'Uncategorized',
      isCustom: true
    });
  }

  return { transactions, errors };
}

/**
 * Imports Investment positions from CSV
 */
export function parseInvestmentsCSV(csvText: string): { investments: Investment[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const errors: string[] = [];
  const investments: Investment[] = [];

  if (lines.length < 2) {
    return { investments: [], errors: ['Investments CSV is empty or missing headers.'] };
  }

  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const tickerIdx = header.findIndex(h => h.includes('ticker') || h.includes('symbol'));
  const nameIdx = header.findIndex(h => h.includes('name') || h.includes('asset') || h.includes('desc'));
  const sharesIdx = header.findIndex(h => h.includes('share') || h.includes('quantity') || h.includes('qty') || h.includes('units'));
  const buyPriceIdx = header.findIndex(h => h.includes('buy') || h.includes('cost') || h.includes('avgprice'));
  const currentPriceIdx = header.findIndex(h => h.includes('current') || h.includes('price') || h.includes('marketprice'));
  const classIdx = header.findIndex(h => h.includes('class') || h.includes('assetclass') || h.includes('type'));
  const sectorIdx = header.findIndex(h => h.includes('sector') || h.includes('industry'));

  if (tickerIdx === -1 || sharesIdx === -1) {
    return {
      investments: [],
      errors: ['Could not detect Ticker and Shares columns in the CSV.']
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const cols = parseCSVLine(rawLine);
    if (cols.length < 2) continue;

    const ticker = (cols[tickerIdx] || '').toUpperCase().trim();
    if (!ticker) continue;

    const shares = cleanNumber(cols[sharesIdx] || '1');
    const buyPrice = buyPriceIdx !== -1 ? cleanNumber(cols[buyPriceIdx] || '100') : 100;
    const currPrice = currentPriceIdx !== -1 && cols[currentPriceIdx] ? cleanNumber(cols[currentPriceIdx]) : buyPrice;
    const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : `${ticker} Holding`;
    
    let assetClass: Investment['assetClass'] = 'Stocks';
    if (classIdx !== -1 && cols[classIdx]) {
      const c = cols[classIdx].toLowerCase();
      if (c.includes('etf')) assetClass = 'ETFs';
      else if (c.includes('crypto') || c.includes('coin')) assetClass = 'Crypto';
      else if (c.includes('bond')) assetClass = 'Bonds';
      else if (c.includes('cash')) assetClass = 'Cash';
    }

    const sector = sectorIdx !== -1 && cols[sectorIdx] ? cols[sectorIdx].trim() : 'Broad Market';

    investments.push({
      id: `inv-imp-${Date.now()}-${i}`,
      ticker,
      name,
      shares,
      buyPrice,
      currentPrice: currPrice,
      assetClass,
      sector
    });
  }

  return { investments, errors };
}

/**
 * Downloads a file to user browser
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts array of objects to CSV string
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const val = item[header] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, filename);
}
