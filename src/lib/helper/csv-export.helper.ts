function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, header: string[], rows: string[][]): void {
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
