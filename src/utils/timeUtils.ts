export const TIME_REGEX = /(\d{1,2}):(\d{2}):\d{2}/;

/**
 * Extracts and formats time from a string (HH:MM:SS) to (H:MM AM/PM).
 * @param str The input string containing time.
 * @returns Formatted time string or original string if no match.
 */
export function extractTime(str: any): any {
  if (!str) return '';
  const match = String(str).match(TIME_REGEX);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  return str;
}
