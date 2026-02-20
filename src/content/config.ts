import { defineCollection, z } from 'astro:content';

const eventsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        time: z.string(),
        location: z.string(),
        organizerLink: z.string().url(),
    }),
});

export const collections = {
    'events': eventsCollection,
};
