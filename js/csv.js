// CSV Generator & Native Android Web Share API Integration

/**
 * Generate RFC 4180 compliant CSV content string from project
 */
export function generateCSV(project) {
  if (!project) return '';

  const counters = project.counters || [];
  const totalCount = counters.reduce((sum, c) => sum + (c.count || 0), 0);

  // Format ISO timestamp (e.g. 2026-08-08 20:20:00)
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const lines = [
    `Project Title,${escapeCsvCell(project.title)}`,
    `Export Date,${dateStr}`,
    `Total Items Counted,${totalCount}`,
    '',
    'Category Title,Total Count'
  ];

  counters.forEach(c => {
    lines.push(`${escapeCsvCell(c.title)},${c.count || 0}`);
  });

  return lines.join('\r\n');
}

/**
 * Escape cell text according to RFC 4180 rules
 */
export function escapeCsvCell(cell) {
  const str = String(cell || '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Trigger Native Web Share API or download fallback
 */
export async function exportAndShareCSV(project) {
  if (!project) return false;

  const csvContent = generateCSV(project);
  const safeFilename = `${(project.title || 'counter_export').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}_export.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 1. Try Native Web Share API (Pixel 10 / Android Chrome support)
  if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
    try {
      const file = new File([blob], safeFilename, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${project.title} - Counter Export`,
          text: `Counter export for ${project.title}`
        });
        return { success: true, shared: true };
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled share dialog
        return { success: false, cancelled: true };
      }
      console.warn('Native share failed, falling back to download:', err);
    }
  }

  // 2. Direct Blob Download Fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { success: true, shared: false };
}
