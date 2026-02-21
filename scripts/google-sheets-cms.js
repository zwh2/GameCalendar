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
