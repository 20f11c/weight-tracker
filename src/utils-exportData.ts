import type { DailyWeight, UserProfile } from './types';

/**
 * Generate CSV string with Chinese headers
 */
export function exportToCSV(records: DailyWeight[], user: UserProfile): string {
  const infoRows = [
    `身高(cm),${user.height_cm}`,
    `初始体重(kg),${user.initial_weight_kg}`,
    '',
  ];
  const headers = ['日期', '早晨体重(kg)', '晚饭后体重(kg)', '日均体重(kg)', '备注'];
  const rows = records.map((r) => [
    r.date,
    (r.morning_weight_kg ?? '').toString(),
    (r.evening_weight_kg ?? '').toString(),
    r.avg_weight_kg.toString(),
    r.note ?? '',
  ]);

  const escapeCSV = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [
    ...infoRows,
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Generate JSON string with user profile and all records
 */
export function exportToJSON(records: DailyWeight[], user: UserProfile): string {
  return JSON.stringify(
    {
      user,
      records,
      exportDate: new Date().toISOString(),
    },
    null,
    2,
  );
}

/**
 * Trigger browser download
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * High-level export function
 */
export function exportData(
  records: DailyWeight[],
  user: UserProfile,
  format: 'csv' | 'json',
): void {
  if (format === 'csv') {
    const content = exportToCSV(records, user);
    downloadFile(content, `体重记录_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  } else {
    const content = exportToJSON(records, user);
    downloadFile(content, `体重记录_${new Date().toISOString().slice(0, 10)}.json`, 'application/json;charset=utf-8;');
  }
}