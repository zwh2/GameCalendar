import { defineCollection, z } from 'astro:content';
import { GOOGLE_SCRIPT_URL } from '../consts';
import { extractTime } from '../utils/timeUtils';

const googleSheetsLoader = () => ({
    name: 'google-sheets-events',
    load: async ({ store }: any) => {
        store.clear();
        try {
            console.log("Fetching from Google Sheets...", GOOGLE_SCRIPT_URL);
            const response = await fetch(GOOGLE_SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === "error") {
                throw new Error(`Google Script returned error: ${data.message}`);
            }

            console.log("Received data length:", data.length);

            for (const item of data) {
                if (!item.id || item.id === "id") continue; // Skip blank or header rows just in case

                const startTimeFormatted = extractTime(item.startTime);
                const endTimeFormatted = extractTime(item.endTime);
                const timeStr = item.startTime ? `${startTimeFormatted} - ${endTimeFormatted}` : item.time || '';

                store.set({
                    id: String(item.id),
                    data: {
                        title: item.title,
                        description: item.description || '',
                        date: new Date(item.date),
                        time: timeStr,
                        location: item.location || '',
                        organizerLink: item.organizerLink || '',
                        body: item.body || ''
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load events from Google Sheets:', e);
            throw e; // Fail the build if data cannot be loaded
        }
    }
});

const eventsCollection = defineCollection({
    loader: googleSheetsLoader(),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        time: z.string(),
        location: z.string(),
        // Ensure strictly safe URLs (http/https) or empty string
        organizerLink: z.string().url().refine((url) => url.startsWith('http'), {
            message: "Must start with http:// or https://"
        }).or(z.literal('')),
        body: z.string().optional()
    }),
});

export const collections = {
    'events': eventsCollection,
};
