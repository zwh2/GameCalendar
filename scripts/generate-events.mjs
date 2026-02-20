import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG_FILE = 'src/content/recurring-events.json';
const EVENTS_DIR = path.join(process.cwd(), 'src/content/events');
const MONTHS_TO_GENERATE = 6;

// Helper to check if a file exists
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        return false;
    }
};

// Generate markdown content
const generateMarkdown = (event, dateStr) => {
    return `---
title: "${event.title}"
description: "${event.description}"
date: ${dateStr}
time: "${event.time}"
location: "${event.location}"
organizerLink: "${event.organizerLink}"
---

${event.body || "Join us for our regular event! Bring your favorite games or play some of ours."}
`;
};

// Main function
const generateEvents = () => {
    if (!fileExists(CONFIG_FILE)) {
        console.error(`Config file not found: ${CONFIG_FILE}`);
        return;
    }

    // Ensure output directory exists
    if (!fileExists(EVENTS_DIR)) {
        fs.mkdirSync(EVENTS_DIR, { recursive: true });
    }

    const rawConfig = fs.readFileSync(CONFIG_FILE, 'utf-8');
    let eventsConfig;
    try {
        eventsConfig = JSON.parse(rawConfig);
    } catch (e) {
        console.error('Error parsing recurring-events.json:', e);
        return;
    }

    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + MONTHS_TO_GENERATE, today.getDate());

    let generatedCount = 0;
    let skippedCount = 0;

    console.log(`Generating events from ${today.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`);

    eventsConfig.forEach((eventDef) => {
        const r = eventDef.recurrence;
        if (!r) return;

        // We will iterate day-by-day and check if it matches the rule.
        // (This is brute-force but completely fine for 6 months).
        let d = new Date(today);
        // Strip time for clean date iteration
        d.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        while (d <= end) {
            let matchesRule = false;
            const currentYear = d.getFullYear();
            const currentMonth = d.getMonth();
            const currentDate = d.getDate();
            const currentDayOfWeek = d.getDay();

            if (r.type === 'weekly') {
                if (currentDayOfWeek === r.weekday) {
                    matchesRule = true;
                }
            } else if (r.type === 'monthly-date') {
                if (currentDate === r.date) {
                    matchesRule = true;
                }
            } else if (r.type === 'monthly-nth-weekday') {
                // Find if this is the n-th occurrence of the weekday in this month
                if (currentDayOfWeek === r.weekday) {
                    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
                    // Find the date of the first occurrence of this weekday
                    let firstOccurrenceDate = 1 + (r.weekday - firstDayOfMonth + 7) % 7;
                    let nthOccurrenceDate = firstOccurrenceDate + (r.n - 1) * 7;

                    if (currentDate === nthOccurrenceDate) {
                        matchesRule = true;
                    }
                }
            }

            if (matchesRule) {
                // Format YYYY-MM-DD cleanly using local timezone
                const m = String(currentMonth + 1).padStart(2, '0');
                const dayStr = String(currentDate).padStart(2, '0');
                const dateStr = `${currentYear}-${m}-${dayStr}`;

                const fileName = `${eventDef.slug}-${dateStr}.md`;
                const filePath = path.join(EVENTS_DIR, fileName);

                if (!fileExists(filePath)) {
                    console.log(`[CREATE] ${fileName}`);
                    const mdContent = generateMarkdown(eventDef, dateStr);
                    fs.writeFileSync(filePath, mdContent, 'utf-8');
                    generatedCount++;
                } else {
                    // Commented out to reduce console spam, but useful for debugging
                    // console.log(`[SKIP] ${fileName} (Already exists)`);
                    skippedCount++;
                }
            }

            // Next day
            d.setDate(d.getDate() + 1);
        }
    });

    console.log(`\nDone! Generated ${generatedCount} new events. Skipped ${skippedCount} existing files.`);
};

// Run the generator
generateEvents();
