/**
 * ============================================================================
 * LEVI.AI - GOOGLE APPS SCRIPT FORM INTEGRATION
 * ============================================================================
 * 
 * Target Google Sheet: Automatically creates or uses sheet named "Responses"
 * Columns:
 *   1. Timestamp
 *   2. Name
 *   3. Email
 *   4. Phone
 * 
 * Deploy Instructions:
 * 1. Open your Google Sheet (or create a new one at sheets.google.com).
 * 2. Click "Extensions" > "Apps Script".
 * 3. Replace all existing code with this Code.gs file.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Configuration:
 *    - Description: "Levi.ai Lead Collection Webhook"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL for receiving web submissions)
 * 7. Click "Deploy", authorize access, and copy the Web App URL.
 * ============================================================================
 */

const SHEET_NAME = "Responses";
const HEADERS = ["Timestamp", "Name", "Email", "Phone"];
const HEADER_BG_COLOR = "#0c0e13";
const HEADER_TEXT_COLOR = "#00e5ff";

/**
 * Handles HTTP GET requests (Primary method for Levi.ai landing page)
 * Query parameters: name, email, phone
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Handles HTTP POST requests (Backup handler for API or webhook integrations)
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Core processor for handling both GET and POST payloads
 */
function handleRequest(e) {
  const lock = LockService.getScriptLock();
  
  // Wait up to 30 seconds for concurrent requests to prevent row overwrites
  try {
    lock.waitLock(30000);
  } catch (lockError) {
    return createJsonResponse({
      success: false,
      error: "Server is currently busy. Please retry shortly."
    });
  }

  try {
    // Extract parameters from GET or POST
    let params = {};
    
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      params = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Fallback for form-encoded POST
        params = e.parameter || {};
      }
    }

    const name = (params.name || "").toString().trim();
    const email = (params.email || "").toString().trim();
    const phone = (params.phone || "").toString().trim();

    // Basic validation
    if (!name && !email && !phone) {
      return createJsonResponse({
        success: false,
        error: "Missing required fields (name, email, phone)."
      });
    }

    // Get or create the "Responses" spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Setup headers
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground(HEADER_BG_COLOR);
      headerRange.setFontColor(HEADER_TEXT_COLOR);
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Format current timestamp
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "GMT",
      "yyyy-MM-dd HH:mm:ss"
    );

    // Append new lead row
    sheet.appendRow([timestamp, name, email, phone]);

    // Format cell alignment
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 3).setNumberFormat("@"); // Format email as text
    sheet.getRange(lastRow, 4).setNumberFormat("@"); // Format phone as text

    // Auto-resize columns for readability
    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }

    // Optional: Send auto-reply welcome email if valid email provided
    if (email && email.includes("@")) {
      try {
        sendWelcomeEmail(email, name);
      } catch (mailError) {
        Logger.log("Welcome email notification error: " + mailError.toString());
      }
    }

    return createJsonResponse({
      success: true,
      message: "Lead successfully recorded in Google Sheets",
      timestamp: timestamp
    });

  } catch (err) {
    Logger.log("Error processing lead: " + err.toString());
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Creates standardized JSON response with proper CORS & MimeType
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Optional auto-reply email to new leads
 */
function sendWelcomeEmail(toEmail, recipientName) {
  const displayName = recipientName ? recipientName.split(" ")[0] : "there";
  const subject = "Welcome to Levi.ai - Next-Gen Intelligence";
  
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0e13; color: #e2e2ea; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 1px solid rgba(0, 229, 255, 0.3); padding-bottom: 20px; margin-bottom: 24px;">
        <h1 style="color: #00e5ff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Levi<span style="color: #a8ffd2;">.ai</span></h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #e2e2ea;">Hi ${displayName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #bac9cc;">
        Thank you for joining the Levi.ai waitlist! We are revolutionizing autonomous AI agents and enterprise data workflows.
      </p>
      <div style="background-color: #191c21; border-left: 4px solid #00e5ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #a8ffd2; font-weight: 600;">What happens next?</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #bac9cc;">
          Our deployment team is provisioning your sandbox environment. You'll receive your priority onboarding invite and API access token shortly.
        </p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #bac9cc;">
        In the meantime, feel free to try our real-time AI assistant directly on our homepage!
      </p>
      <p style="margin-top: 32px; font-size: 14px; color: #849396; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px;">
        Best regards,<br>
        <strong style="color: #e2e2ea;">The Levi.ai Team</strong><br>
        <span style="font-size: 12px; color: #849396;">personal-ai-ruby.vercel.app</span>
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Self-test function you can run directly inside the Google Apps Script editor
 */
function testFormSubmission() {
  const mockEvent = {
    parameter: {
      name: "Test Developer",
      email: "developer@example.com",
      phone: "+1 555-0199"
    }
  };
  const result = doGet(mockEvent);
  Logger.log("Test Result: " + result.getContent());
}
