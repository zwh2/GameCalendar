// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://gamecalendar.org',
  base: process.env.BASE_PATH || undefined,
});
