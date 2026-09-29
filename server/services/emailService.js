const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Send GENFREX Appointment Letter via Email
 * @param {Object} options
 * @param {string} options.toCandidateEmail
 * @param {string} options.candidateName
 * @param {string} options.designation
 * @param {string} options.referenceNumber
 * @param {string} options.joiningDate
 * @param {string} options.pdfPath
 * @param {string} options.pdfFileName
 * @returns {Promise<{ success: boolean, messageId: string, simulated: boolean }>}
 */
const sendAppointmentEmail = async ({
  toCandidateEmail,
  candidateName,
  designation,
  referenceNumber,
  joiningDate,
  pdfPath,
  pdfFileName
}) => {
  const fromEmail = process.env.SMTP_FROM || process.env.OFFICIAL_EMAIL || 'genfrexofficial@gmail.com';
  const subject = `GENFREX — Appointment Letter — ${designation} (${referenceNumber})`;

  const formattedJoiningDate = new Date(joiningDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #080B14; color: #F8FAFC; margin: 0; padding: 24px; }
        .container { max-width: 620px; margin: 0 auto; background-color: #111827; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #0052FF 0%, #1D4ED8 100%); padding: 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px; }
        .header p { margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E0E7FF; }
        .content { padding: 32px 28px; color: #E2E8F0; line-height: 1.6; font-size: 14px; }
        .card { background-color: #1E293B; border-radius: 8px; padding: 18px; margin: 20px 0; border-left: 4px solid #0052FF; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .card-label { color: #94A3B8; font-weight: 600; }
        .card-value { color: #F8FAFC; font-weight: 600; }
        .btn { display: inline-block; background-color: #0052FF; color: #FFFFFF !important; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; text-align: center; }
        .footer { background-color: #0B0F19; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GENFREX</h1>
          <p>Digital Services & Talent Ecosystem</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; font-weight: 600; color: #ffffff;">Dear ${candidateName},</p>
          <p>Congratulations! On behalf of <strong>GENFREX</strong>, we are delighted to present your official Trainee Appointment Letter for the role of <strong>${designation}</strong>.</p>
          
          <div class="card">
            <div class="card-row"><span class="card-label">Reference Number:</span> <span class="card-value">${referenceNumber}</span></div>
            <div class="card-row"><span class="card-label">Position:</span> <span class="card-value">${designation}</span></div>
            <div class="card-row"><span class="card-label">Date of Joining:</span> <span class="card-value">${formattedJoiningDate}</span></div>
            <div class="card-row" style="margin-bottom: 0;"><span class="card-label">Official Sender:</span> <span class="card-value">${fromEmail}</span></div>
          </div>

          <p>Please find attached your official appointment letter containing details of your role, responsibilities, compensation/stipend, and terms of engagement.</p>
          <p>Kindly review the attached document carefully and return a signed copy acknowledging your acceptance on or before the acceptance deadline.</p>

          <p style="margin-top: 24px;">If you have any questions or require clarification, please do not hesitate to contact our HR operations team directly at <a href="mailto:${fromEmail}" style="color: #60A5FA;">${fromEmail}</a>.</p>

          <p style="margin-top: 32px; color: #94A3B8; font-size: 13px;">Warm regards,<br><strong style="color: #F8FAFC;">GENFREX Talent & People Operations</strong><br>Build. Grow. Connect.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GENFREX Digital Services Ecosystem. All rights reserved.<br>
          This is an official communication containing confidential candidate information.
        </div>
      </div>
    </body>
    </html>
  `;

  // Attachments
  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: pdfFileName || 'GENFREX_Appointment_Letter.pdf',
      path: pdfPath
    });
  }

  // Check if SMTP is configured
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host: host,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"GENFREX People Operations" <${fromEmail}>`,
      to: toCandidateEmail,
      subject,
      html: htmlBody,
      attachments
    });

    return {
      success: true,
      messageId: info.messageId || `msg_${Date.now()}`,
      simulated: false
    };
  } else {
    // Graceful development mode simulation when external SMTP credentials are not yet populated in .env
    console.log(`[Email Service - Simulated Send]`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${toCandidateEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Attachment: ${pdfFileName || 'GENFREX_Appointment_Letter.pdf'}`);
    console.log(`   Status: Send simulated successfully. Configure SMTP in server/.env for production live dispatch.`);

    return {
      success: true,
      messageId: `simulated_gfx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      simulated: true
    };
  }
};

module.exports = {
  sendAppointmentEmail
};
