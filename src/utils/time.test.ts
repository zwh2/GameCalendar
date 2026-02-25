import { test } from 'node:test';
import assert from 'node:assert';
import { extractTime } from './time.ts';

test('extractTime formats HH:MM:SS to H:MM AM/PM', () => {
    assert.strictEqual(extractTime('14:30:00'), '2:30 PM');
    assert.strictEqual(extractTime('09:15:00'), '9:15 AM');
    assert.strictEqual(extractTime('12:00:00'), '12:00 PM');
    assert.strictEqual(extractTime('00:00:00'), '12:00 AM');
});

test('extractTime returns original string if no match', () => {
    assert.strictEqual(extractTime('18:00'), '18:00');
    assert.strictEqual(extractTime('not a time'), 'not a time');
});

test('extractTime handles empty input', () => {
    assert.strictEqual(extractTime(''), '');
    assert.strictEqual(extractTime(null), '');
    assert.strictEqual(extractTime(undefined), '');
});
