import { defineCollection, z } from 'astro:content';
import { googleSheetsLoader } from '../utils/googleSheetsLoader';

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
