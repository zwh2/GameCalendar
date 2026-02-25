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

## Backend: Google Sheets & Apps Script

The backend database for the Game Calendar is an external Google Sheet. Submissions go to a `Submissions` tab, and approved events are moved to an `Approved` tab, which acts as a headless CMS for Astro. The site also includes a built-in tool for generating recurring events.

### Setup Instructions

To deploy the required Google Apps Script backend to your Google Sheet:

1. **Create the Google Sheet:** Create a new Google Sheet. You do not need to manually configure the column headers (the script will do that automatically).
2. **Open Apps Script Editor:** In your Sheet, go to **Extensions > Apps Script**.
3. **Add the Code:** 
    - Replace the contents of the default `Code.gs` file with the contents from [`scripts/google-sheets-cms.js`](scripts/google-sheets-cms.js) in this repository.
    - Click the **+** (Add a file) button next to Files, select **HTML**, and explicitly name it `Sidebar` (this will create `Sidebar.html`).
    - Paste the contents from [`scripts/Sidebar.html`](scripts/Sidebar.html) into this new file.
4. **Deploy as a Web App (For Form Submissions and CMS Access):**
    - Click **Deploy > New deployment**.
    - Configure type to **Web app**.
    - Execute as: **Me**.
    - Who has access: **Anyone**.
    - Click **Deploy** and authorize the script when prompted.
    - Copy the generated `Web app URL` and replace the endpoint inside `src/consts.ts` and `src/pages/submit.astro`.
5. **Set up Triggers (For automatic row moving):**
    - Go to **Triggers** (alarm clock icon on the left panel).
    - Add a new trigger:
        - Function to run: `onEdit`
        - Deployment: `Head`
        - Event source: `From spreadsheet`
        - Event type: `On edit`
    - Save and authorize if necessary.
6. **Start Using:** Refresh your Google Sheet. You should now see two tabs created automatically upon your first submission (`Submissions` and `Approved`) as well as a new **GameCalendar** custom menu at the top for generating recurring events.
