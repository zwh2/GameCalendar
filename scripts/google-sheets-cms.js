const SUBMISSIONS_SHEET = "Submissions";
const APPROVED_SHEET = "Approved";

// 1. Handles the incoming Form Submission
function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBMISSIONS_SHEET);
        if (!sheet) throw new Error("Missing Submissions sheet");

        const params = e.parameter;

        // Automatically generate column headers if the sheet is completely blank
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["Timestamp", "id", "title", "date", "startTime", "endTime", "location", "organizerLink", "description", "body", "Approve?"]);
        }

        const timestamp = new Date();
        // Generate a simple unique ID that Astro requires for collections
        const id = "evt_" + new Date().getTime();

        // Append the row matching the Astro frontend form, adding 'FALSE' for the checkbox
        sheet.appendRow([
            timestamp,
            id,
            params.title || "",
            params.date || "",
            params.startTime || "",
            params.endTime || "",
            params.location || "",
            params.organizerLink || "",
            params.description || "",
            params.body || "",
            false
        ]);

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// 2. Serves the Approved Events to Astro as a JSON API during build
function doGet(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APPROVED_SHEET);
        if (!sheet) throw new Error("Missing Approved sheet");

        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) {
            return ContentService.createTextOutput(JSON.stringify([]))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Row 1 is headers: ["Timestamp", "id", "title", "date", "startTime", "endTime", "location", "organizerLink", "description", "body"]
        const headers = data[0];
        const rows = data.slice(1);

        const jsonArray = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                let val = row[index];
                // Clean up any Google Sheets auto-formatting of dates
                if (val instanceof Date) {
                    if (header === 'date') val = val.toISOString().split('T')[0];
                    else val = val.toISOString();
                }
                obj[header] = String(val); // Ensure all data comes back as clean strings
            });
            return obj;
        });

        return ContentService.createTextOutput(JSON.stringify(jsonArray))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// 3. Automatically moves rows when the "Approve?" checkbox is clicked
function onEdit(e) {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();

    // Only trigger on the Submissions tab
    if (sheet.getName() !== SUBMISSIONS_SHEET) return;

    // Check if the edited column is the 11th column (K) and the tickbox is checked (true)
    if (e.range.getColumn() === 11 && e.value === "TRUE") {
        const row = e.range.getRow();
        // Don't ever move the header row
        if (row === 1) return;

        // Get the entire row of data
        const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

        const approvedSheet = e.source.getSheetByName(APPROVED_SHEET);
        if (!approvedSheet) return;

        // Copy headers to Approved sheet if it's completely empty
        if (approvedSheet.getLastRow() === 0) {
            // Exclude the checkbox header
            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() - 1).getValues()[0];
            approvedSheet.appendRow(headers);
        }

        // Remove the trailing true/false checkbox from the data
        const dataToMove = rowData.slice(0, rowData.length - 1);

        // Append the clean row to the Approved tab
        approvedSheet.appendRow(dataToMove);

        // Delete the original row from Submissions tab
        sheet.deleteRow(row);
    }
}

// ==========================================
// RECURRING EVENTS GENERATOR
// ==========================================

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('GameCalendar')
        .addItem('Generate Recurring Events', 'showRecurringSidebar')
        .addToUi();
}

function showRecurringSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('Sidebar')
        .setTitle('Recurring Events')
        .setWidth(350);
    SpreadsheetApp.getUi().showSidebar(html);
}

// Generates dates based on settings and appends them to the sheet
function generateEvents(eventData) {
    // Use the Approved sheet directly if possible, else fallback to active
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Approved");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const dates = calculateDates(eventData);
    if (dates.length === 0) {
        throw new Error("No dates generated. Check your start date.");
    }

    const rows = dates.map(date => {
        let row = new Array(headers.length).fill('');

        headers.forEach((header, index) => {
            let h = header.toString().toLowerCase().trim();

            if (h === 'id') row[index] = generateId();
            else if (h === 'title') row[index] = eventData.title;
            else if (h === 'date') row[index] = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
            else if (h === 'starttime') row[index] = eventData.startTime;
            else if (h === 'endtime') row[index] = eventData.endTime;
            else if (h === 'time') row[index] = eventData.startTime ? `${eventData.startTime} - ${eventData.endTime}` : '';
            else if (h === 'location') row[index] = eventData.location;
            else if (h === 'description') row[index] = eventData.description;
            else if (h === 'organizerlink') row[index] = eventData.organizerLink;
            else if (h === 'body') row[index] = eventData.body || '';
        });

        return row;
    });

    // Append to bottom of sheet
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    return dates.length;
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function calculateDates(eventData) {
    const dates = [];
    let currentDate = new Date(eventData.startDate);
    // Normalize time to noon to avoid daylight saving issues
    currentDate.setHours(12, 0, 0, 0);

    const occurrences = parseInt(eventData.occurrences, 10);
    const freq = eventData.frequency;

    for (let i = 0; i < occurrences; i++) {
        // Add the current calculated date, ignoring the original start date for Nth Day rule
        // if the start date doesn't match the Nth day rule itself.
        if (i === 0 && freq === 'monthly_nth') {
            currentDate = getNthDayOfMonth(currentDate.getFullYear(), currentDate.getMonth(), parseInt(eventData.nthWeek), parseInt(eventData.nthDay));
        }

        // Copy the date
        dates.push(new Date(currentDate));

        if (freq === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (freq === 'monthly_date') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (freq === 'monthly_nth') {
            // Move to next month and find the Nth day again
            let nextMonth = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();
            if (nextMonth > 11) {
                nextMonth = 0;
                year++;
            }
            currentDate = getNthDayOfMonth(year, nextMonth, parseInt(eventData.nthWeek), parseInt(eventData.nthDay));
        }
    }
    return dates;
}

// nthWeek: 1-5 (5 = last), dayOfWeek: 0-6 (0 = Sunday)
function getNthDayOfMonth(year, month, nthWeek, dayOfWeek) {
    let date = new Date(year, month, 1, 12, 0, 0, 0);
    let firstDay = date.getDay();

    let offset = dayOfWeek - firstDay;
    if (offset < 0) offset += 7;

    let firstOccurrence = 1 + offset; // Start day of the 1st matching day-of-week

    if (nthWeek <= 4) {
        date.setDate(firstOccurrence + (nthWeek - 1) * 7);
    } else if (nthWeek === 5) {
        // Determine the last occurence (could be 4th or 5th)
        let fifthOccurrence = firstOccurrence + 28;
        let tempDate = new Date(year, month, fifthOccurrence, 12, 0, 0, 0);
        if (tempDate.getMonth() === month) {
            date = tempDate;
        } else {
            date.setDate(firstOccurrence + 21); // Set to 4th occurrence if 5th is in next month
        }
    }
    return date;
}
