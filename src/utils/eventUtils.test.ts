import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getUpcomingEvents, type Event } from './eventUtils.ts';

describe('eventUtils', () => {
  describe('getUpcomingEvents', () => {
    const mockEvents: Event[] = [
      { id: '1', data: { title: 'Past Event', date: new Date('2020-01-01') } },
      { id: '2', data: { title: 'Future Event 1', date: new Date('2025-01-01') } },
      { id: '3', data: { title: 'Future Event 2', date: new Date('2025-06-01') } },
      { id: '4', data: { title: 'Today Event', date: new Date('2024-05-20') } },
    ];

    const referenceDate = new Date('2024-05-20');

    test('should filter out past events', () => {
      const result = getUpcomingEvents(mockEvents, referenceDate);
      const titles = result.map(e => e.data.title);
      assert.ok(!titles.includes('Past Event'), 'Should not include past event');
    });

    test('should include events on the reference date', () => {
      const result = getUpcomingEvents(mockEvents, referenceDate);
      const titles = result.map(e => e.data.title);
      assert.ok(titles.includes('Today Event'), 'Should include today event');
    });

    test('should include future events', () => {
      const result = getUpcomingEvents(mockEvents, referenceDate);
      const titles = result.map(e => e.data.title);
      assert.ok(titles.includes('Future Event 1'), 'Should include future event 1');
      assert.ok(titles.includes('Future Event 2'), 'Should include future event 2');
    });

    test('should sort events by date (soonest first)', () => {
      const result = getUpcomingEvents(mockEvents, referenceDate);
      assert.strictEqual(result[0].data.title, 'Today Event');
      assert.strictEqual(result[1].data.title, 'Future Event 1');
      assert.strictEqual(result[2].data.title, 'Future Event 2');
    });

    test('should handle dates as strings', () => {
      const eventsWithStrings: Event[] = [
        { id: '1', data: { title: 'String Date Future', date: '2025-01-01' } },
        { id: '2', data: { title: 'String Date Past', date: '2020-01-01' } },
      ];
      const result = getUpcomingEvents(eventsWithStrings, referenceDate);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].data.title, 'String Date Future');
    });

    test('should return empty array if no events match', () => {
      const pastEvents: Event[] = [
        { id: '1', data: { title: 'Past Event', date: new Date('2020-01-01') } },
      ];
      const result = getUpcomingEvents(pastEvents, referenceDate);
      assert.strictEqual(result.length, 0);
    });
  });
});
