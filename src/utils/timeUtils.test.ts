import { test, describe } from 'node:test';
import assert from 'node:assert';
import { extractTime } from './timeUtils.ts';

describe('timeUtils', () => {
  describe('extractTime', () => {
    test('should format morning time correctly', () => {
      assert.strictEqual(extractTime('09:30:00'), '9:30 AM');
    });

    test('should format afternoon time correctly', () => {
      assert.strictEqual(extractTime('15:45:00'), '3:45 PM');
    });

    test('should format midnight correctly (00:xx:xx)', () => {
      assert.strictEqual(extractTime('00:15:00'), '12:15 AM');
    });

    test('should format noon correctly (12:xx:xx)', () => {
      assert.strictEqual(extractTime('12:00:00'), '12:00 PM');
    });

    test('should format 11 PM correctly', () => {
      assert.strictEqual(extractTime('23:59:00'), '11:59 PM');
    });

    test('should format 1 AM correctly', () => {
      assert.strictEqual(extractTime('01:05:00'), '1:05 AM');
    });

    test('should return original string if it does not match the regex', () => {
      assert.strictEqual(extractTime('Not a time'), 'Not a time');
      assert.strictEqual(extractTime('12:34'), '12:34'); // Missing seconds
    });

    test('should return empty string for falsy input', () => {
      assert.strictEqual(extractTime(''), '');
      assert.strictEqual(extractTime(null), '');
      assert.strictEqual(extractTime(undefined), '');
    });

    test('should handle numeric input by returning it as is', () => {
        // Technically the regex expects colons, so a number won't match
        assert.strictEqual(extractTime(123), 123);
    });
  });
});
