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
  return events
    .filter((event) => {
      const eventDate = new Date(event.data.date);
      // Set hours, minutes, seconds, and ms to 0 for a fair comparison of just the date if needed,
      // but the original code used full Date comparison.
      // To match original behavior:
      return eventDate >= referenceDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.data.date).valueOf();
      const dateB = new Date(b.data.date).valueOf();
      return dateA - dateB;
    });
}
