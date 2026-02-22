# Game Calendar

This repository contains the source code for the **Game Calendar** website.

## Live Site

You can visit the live site here:
**[https://zhudson.github.io/GameCalendar](https://zhudson.github.io/GameCalendar)**

## Development

To run the project locally, follow these steps:

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the site at `http://localhost:4321/GameCalendar`.

> **Note:** Event data is automatically fetched from a Google Sheet during the build process (including `npm run dev`). No manual data synchronization is required.

## Building and Hosting

This site is built with [Astro](https://astro.build) and hosted on **GitHub Pages** using GitHub Actions.

### Building
To create a production build manually:
```bash
npm run build
```
This generates the static site in the `dist/` directory.

### Hosting & Deployment
The deployment process is automated via the workflow defined in `.github/workflows/deploy.yml`.

-   **Push to Main:** Pushing changes to the `main` branch automatically triggers a build and deploys the update to GitHub Pages.
-   **Nightly Updates:** A cron job runs every night at 8AM UTC to rebuild the site. This fetches the latest event data from the Google Sheet, ensuring the calendar remains up-to-date without manual intervention.
