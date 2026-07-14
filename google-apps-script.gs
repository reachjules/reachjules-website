/* ============================================================================
   reachjulian — lead handler (Google Apps Script)

   This file is NOT part of the website. It's a tiny free script that lives in
   your Google account. Every time someone submits the form, it:
     1. adds a row to a Google Sheet (your running list of leads), and
     2. optionally pings a Slack channel.

   ----------------------------------------------------------------------------
   ONE-TIME SETUP (free, ~5 minutes, no command line):

   1. Go to https://sheets.google.com and create a new blank spreadsheet.
      Name it something like "reachjulian leads".

   2. In that sheet, open  Extensions -> Apps Script.
      Delete whatever sample code is there, and paste in THIS entire file.

   3. (Optional) To also get a Slack ping: create a Slack Incoming Webhook
      (https://api.slack.com/apps -> Create App -> Incoming Webhooks -> add one
      to your #leads channel), copy its URL, and paste it between the quotes on
      the SLACK_WEBHOOK_URL line below. Leave it "" to skip Slack.

   4. Click  Deploy -> New deployment.
      - Type: Web app
      - Description: reachjulian form
      - Execute as: Me
      - Who has access: Anyone
      Click Deploy, then Authorize access and allow the permissions.

   5. Copy the "Web app URL" it gives you (ends in /exec).

   6. Open index.html, find LEAD_CONFIG near the bottom, and:
        mode: "apps-script",
        appsScriptUrl: "PASTE_THE_WEB_APP_URL_HERE",
      Re-upload index.html to GitHub. Done — leads now land in your Sheet.

   Tip: submit the form once yourself to confirm a row appears.
   ============================================================================ */

// Optional. Paste a Slack Incoming Webhook URL to also get a Slack message.
var SLACK_WEBHOOK_URL = "";

// Tab name inside your spreadsheet. Created automatically if missing.
var SHEET_NAME = "Leads";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot: bots fill "company"; humans never see it. Silently ignore.
    if (data.company) { return ok(); }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Add a header row the first time.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "City / Area",
                       "Business", "Annual Revenue", "Notes"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
    }

    sheet.appendRow([
      new Date(),
      data.name || "", data.email || "", data.phone || "",
      data.city || "", data.biz || "", data.revenue || "", data.note || ""
    ]);

    if (SLACK_WEBHOOK_URL) {
      var text = [
        ":round_pushpin: *New lead — reachjulian.com*",
        "*Name:* " + (data.name || "—"),
        "*Email:* " + (data.email || "—"),
        "*Phone:* " + (data.phone || "—"),
        "*City / area:* " + (data.city || "—"),
        "*Business:* " + (data.biz || "—"),
        "*Annual revenue:* " + (data.revenue || "—"),
        "*Notes:* " + (data.note || "—")
      ].join("\n");
      UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({ text: text }),
        muteHttpExceptions: true
      });
    }

    return ok();
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ok() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lets you open the Web App URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput("reachjulian lead endpoint is live.");
}
