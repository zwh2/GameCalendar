import { defineCollection, z } from 'astro:content';

function extractTime(str) {
    if (!str) return '';
    const match = String(str).match(/(\d{1,2}):(\d{2}):\d{2}/);
    if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    }
    return str;
}

const googleSheetsLoader = () => ({
    name: 'google-sheets-events',
    load: async ({ store }: any) => {
        store.clear();
        try {
            console.log("Fetching from Google Sheets...");
            const response = await fetch('https://script.google.com/macros/s/AKfycbznflNUtglKfLYljc_BZ3IiPZ3rCeDEocBzjeCeuGc-weqWrnK90Aua7dVEKfOJ4E9boA/exec');
            const data = await response.json();
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
                console.log("Successfully stored item:", item.id);
            }
        } catch (e) {
            console.error('Failed to load events from Google Sheets:', e);
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
        organizerLink: z.string().url().or(z.string()),
        body: z.string().optional()
    }),
});

export const collections = {
    'events': eventsCollection,
};
