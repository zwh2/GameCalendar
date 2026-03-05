export interface Event {
  data: {
    date: Date | string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Filters and sorts events by date.
 * By default, it returns upcoming events (including today) sorted by date (soonest first).
 *
 * @param events - Array of event objects
 * @param referenceDate - The date to compare against for filtering (defaults to now)
 * @returns Filtered and sorted events
 */
export function getUpcomingEvents(events: Event[], referenceDate: Date = new Date()): Event[] {
  // Get the local YYYY-MM-DD string for the reference date
  const refYear = referenceDate.getFullYear();
  const refMonth = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const refDay = String(referenceDate.getDate()).padStart(2, '0');
  const localTodayStr = `${refYear}-${refMonth}-${refDay}`;

  return events
    .filter((event) => {
      const eventDate = new Date(event.data.date);
      // Because Astro config parses the string as midnight UTC,
      // we can extract the exact YYYY-MM-DD back using toISOString()
      const eventDateStr = eventDate.toISOString().split('T')[0];

      // Compare lexicographically (e.g. "2026-03-04" >= "2026-03-04")
      return eventDateStr >= localTodayStr;
    })
    .sort((a, b) => {
      const dateA = new Date(a.data.date).valueOf();
      const dateB = new Date(b.data.date).valueOf();
      return dateA - dateB;
    });
}
