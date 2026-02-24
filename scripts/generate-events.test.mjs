import { test } from 'node:test';
import assert from 'node:assert';
import { generateMarkdown } from './generate-events.mjs';

test('generateMarkdown generates correct markdown with all fields', () => {
    const event = {
        title: 'Weekly Board Games',
        description: 'Come play board games!',
        time: '18:00',
        location: 'The Gaming Cafe',
        organizerLink: 'https://example.com',
        body: 'Custom body text.'
    };
    const dateStr = '2025-03-01';

    const result = generateMarkdown(event, dateStr);

    const expected = `---
title: "Weekly Board Games"
description: "Come play board games!"
date: 2025-03-01
time: "18:00"
location: "The Gaming Cafe"
organizerLink: "https://example.com"
---

Custom body text.
`;
    assert.strictEqual(result, expected);
});

test('generateMarkdown uses default body when body is missing', () => {
    const event = {
        title: 'Monthly RPG',
        description: 'Tabletop RPG session',
        time: '14:00',
        location: 'Community Center',
        organizerLink: 'https://rpg.example.com'
    };
    const dateStr = '2025-03-15';

    const result = generateMarkdown(event, dateStr);

    assert.ok(result.includes('Join us for our regular event! Bring your favorite games or play some of ours.'));
    assert.ok(result.startsWith('---'));
    assert.ok(result.includes('title: "Monthly RPG"'));
});

test('generateMarkdown formats YAML frontmatter correctly', () => {
    const event = {
        title: 'Event "with" quotes',
        description: 'Description "with" quotes',
        time: '10:00',
        location: 'Somewhere',
        organizerLink: ''
    };
    const dateStr = '2025-04-01';

    const result = generateMarkdown(event, dateStr);

    assert.ok(result.includes('title: "Event \\"with\\" quotes"'));
    assert.ok(result.includes('description: "Description \\"with\\" quotes"'));
});
