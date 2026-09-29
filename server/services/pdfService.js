const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate official GENFREX Appointment Letter A4 PDF
 * @param {Object} appointment
 * @param {Object} candidate
 * @param {Object} template
 * @returns {Promise<{ filePath: string, fileName: string, fileUrl: string }>}
 */
const generateAppointmentPDF = async (appointment, candidate, template = null) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeRef = (appointment.referenceNumber || 'LETTER').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `GENFREX_Appointment_${safeRef}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 55, right: 55 },
        bufferPages: true
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Colors
      const primaryBlue = '#0052FF';
      const darkNavy = '#0A1128';
      const textGray = '#334155';
      const mutedGray = '#64748B';
      const lightBg = '#F8FAFC';
      const borderColor = '#E2E8F0';

      // --- HEADER ---
      // Brand Bar
      doc.rect(55, 45, 485, 3).fill(primaryBlue);

      // Logo / Brand
      const logoPath = path.join(__dirname, '../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 55, 52, { width: 140 });
      } else {
        doc.moveDown(0.8);
        doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryBlue).text('GENFREX', 55, 55);
        doc.fontSize(8.5).font('Helvetica').fillColor(mutedGray).text('DIGITAL SERVICES & TALENT ECOSYSTEM', 55, 80);
      }

      // Right-aligned company contact
      doc.fontSize(8).font('Helvetica').fillColor(mutedGray)
        .text('Email: genfrexofficial@gmail.com', 320, 58, { align: 'right', width: 220 })
        .text('Web: www.genfrex.com', 320, 70, { align: 'right', width: 220 })
        .text('Tagline: Build. Grow. Connect.', 320, 82, { align: 'right', width: 220 });

      // Divider
      doc.strokeColor(borderColor).lineWidth(1).moveTo(55, 98).lineTo(540, 98).stroke();

      // Document Title Box
      doc.rect(55, 108, 485, 30).fill(lightBg);
      doc.rect(55, 108, 485, 30).strokeColor(borderColor).lineWidth(1).stroke();
      doc.fontSize(12).font('Helvetica-Bold').fillColor(darkNavy)
        .text((template?.title || appointment.title || 'TRAINEE APPOINTMENT LETTER').toUpperCase(), 55, 117, {
          align: 'center',
          width: 485
        });

      // Ref and Date Row
      const appDateStr = new Date(appointment.appointmentDate || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textGray).text('Ref No: ', 55, 148, { continued: true });
      doc.font('Helvetica').text(appointment.referenceNumber || 'GFX/HR/2026/0001');

      doc.fontSize(9).font('Helvetica-Bold').fillColor(textGray).text('Date: ', 380, 148, { continued: true });
      doc.font('Helvetica').text(appDateStr);

      // Candidate Details Box
      doc.rect(55, 168, 485, 68).fill(lightBg);
      doc.rect(55, 168, 485, 68).strokeColor(borderColor).stroke();

      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedGray).text('APPOINTED CANDIDATE', 68, 176);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkNavy).text(candidate.name || 'Candidate Name', 68, 190);
      doc.fontSize(8.5).font('Helvetica').fillColor(textGray)
        .text(`Email: ${candidate.email || 'N/A'}  |  Phone: ${candidate.phone || 'N/A'}`, 68, 205)
        .text(`Address: ${candidate.address || 'Bengaluru, Karnataka, India'}`, 68, 218);

      // Salutation & Intro
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkNavy).text(`Dear ${candidate.name || 'Candidate'},`, 55, 250);
      doc.fontSize(9).font('Helvetica').fillColor(textGray).lineGap(2)
        .text(
          `On behalf of GENFREX, we are pleased to issue this Trainee Appointment Letter appointing you as ${appointment.designation} in our ${appointment.department} department. We welcome you to our digital services and talent ecosystem and look forward to your valuable contributions.`,
          55,
          266,
          { width: 485, align: 'justify' }
        );

      // Section: ABOUT GENFREX
      let curY = 312;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('1. ABOUT GENFREX', 55, curY);
      curY += 14;
      const aboutText = template?.aboutGenfrex ||
        'GENFREX is a premier digital services and talent ecosystem committed to empowering enterprises and innovators with cutting-edge software engineering, scalable digital products, and high-impact technical solutions. We bridge industry demands with world-class engineering capabilities.';
      doc.fontSize(8.5).font('Helvetica').fillColor(textGray).lineGap(2)
        .text(aboutText, 55, curY, { width: 485, align: 'justify' });

      // Section: APPOINTMENT DETAILS (Table)
      curY += 48;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('2. APPOINTMENT DETAILS', 55, curY);
      curY += 14;

      const joiningDateStr = new Date(appointment.joiningDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const deadlineDateStr = new Date(appointment.acceptanceDeadline).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const detailsData = [
        ['Designation / Role', appointment.designation, 'Department', appointment.department],
        ['Employment Type', appointment.appointmentType || 'Trainee', 'Working Mode', appointment.workLocation || 'Remote / Hybrid'],
        ['Date of Joining', joiningDateStr, 'Reporting Manager', appointment.reportingManager || 'Engineering Lead'],
        ['Compensation / Stipend', `INR ${Number(appointment.compensation).toLocaleString('en-IN')} / ${appointment.compensationFrequency || 'Month'}`, 'Acceptance Deadline', deadlineDateStr]
      ];

      const rowH = 18;
      const colW1 = 110;
      const colW2 = 132;
      const colW3 = 110;
      const colW4 = 133;

      detailsData.forEach((row, idx) => {
        const yPos = curY + idx * rowH;
        const bg = idx % 2 === 0 ? lightBg : '#FFFFFF';
        doc.rect(55, yPos, 485, rowH).fill(bg);
        doc.rect(55, yPos, 485, rowH).strokeColor(borderColor).stroke();

        doc.fontSize(8).font('Helvetica-Bold').fillColor(textGray).text(row[0], 62, yPos + 5, { width: colW1 - 10 });
        doc.fontSize(8).font('Helvetica').fillColor(darkNavy).text(row[1], 55 + colW1 + 5, yPos + 5, { width: colW2 - 10 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(textGray).text(row[2], 55 + colW1 + colW2 + 5, yPos + 5, { width: colW3 - 10 });
        doc.fontSize(8).font('Helvetica').fillColor(darkNavy).text(row[3], 55 + colW1 + colW2 + colW3 + 5, yPos + 5, { width: colW4 - 10 });
      });

      curY += detailsData.length * rowH + 14;

      // Section: ROLE & RESPONSIBILITIES
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('3. ROLE & RESPONSIBILITIES', 55, curY);
      curY += 14;

      const responsibilities = (appointment.responsibilities && appointment.responsibilities.length > 0)
        ? appointment.responsibilities
        : (template?.roleAndResponsibilities || [
            'Execute assigned technical tasks, modules, and software features in alignment with GENFREX quality standards.',
            'Collaborate proactively with technical leads, cross-functional engineering teams, and project stakeholders.',
            'Participate in sprint planning, architecture reviews, daily standups, and codebase documentation.',
            'Continuously enhance technical proficiencies and adhere to best development and security practices.'
          ]);

      responsibilities.forEach((resp) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryBlue).text('•', 65, curY);
        doc.fontSize(8.5).font('Helvetica').fillColor(textGray).text(resp, 76, curY, { width: 464, align: 'justify' });
        curY += 15;
      });

      // --- PAGE 2 ---
      doc.addPage();

      // Top brand strip on Page 2
      doc.rect(55, 45, 485, 2).fill(primaryBlue);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedGray)
        .text('GENFREX  |  TRAINEE APPOINTMENT LETTER', 55, 52)
        .text(`Ref: ${appointment.referenceNumber}`, 350, 52, { align: 'right', width: 190 });
      doc.strokeColor(borderColor).lineWidth(0.5).moveTo(55, 64).lineTo(540, 64).stroke();

      let p2Y = 75;

      // Section: TERMS & CONDITIONS
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('4. TERMS & CONDITIONS', 55, p2Y);
      p2Y += 14;

      const terms = (appointment.terms && appointment.terms.length > 0)
        ? appointment.terms
        : (template?.termsAndConditions || [
            'Appointment Status: This appointment is for training and professional development within the GENFREX ecosystem. Successful completion of the trainee period may lead to performance-based full-time consideration.',
            'Working Hours & Mode: The trainee shall adhere to the agreed schedule and mode of engagement (Remote, Hybrid, or On-site) specified in the appointment details.',
            'Compensation: A monthly stipend/compensation shall be disbursed in accordance with GENFREX payroll schedules, subject to statutory deductions where applicable.',
            'Notice Period: Either party may terminate this trainee engagement by providing a written notice of 15 days or compensation in lieu thereof during the trainee period.'
          ]);

      terms.forEach((term, idx) => {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkNavy).text(`4.${idx + 1}`, 60, p2Y);
        doc.fontSize(8.5).font('Helvetica').fillColor(textGray).text(term, 80, p2Y, { width: 460, align: 'justify' });
        p2Y += 26;
      });

      p2Y += 5;

      // Section: CONFIDENTIALITY & DATA PROTECTION
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('5. CONFIDENTIALITY & DATA PROTECTION', 55, p2Y);
      p2Y += 14;
      const confText = appointment.confidentialityTerms || template?.confidentialityClause ||
        'The Trainee acknowledges that during the tenure of this appointment, they may have access to confidential, proprietary, trade secret, client data, and intellectual property belonging to GENFREX or its affiliated clients. The Trainee agrees to hold all such information in strict confidence and shall not disclose, replicate, reverse-engineer, or misuse any proprietary data without prior written authorization from GENFREX. This obligation survives the termination or expiration of this appointment.';
      doc.fontSize(8.5).font('Helvetica').fillColor(textGray).lineGap(1.5)
        .text(confText, 55, p2Y, { width: 485, align: 'justify' });

      p2Y += 52;

      // Section: PROFESSIONAL CONDUCT & COMPLIANCE
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('6. PROFESSIONAL CONDUCT & COMPLIANCE', 55, p2Y);
      p2Y += 14;
      const conductText = appointment.professionalConductTerms || template?.professionalConductClause ||
        'The Trainee agrees to maintain the highest standards of professional integrity, diligence, and ethical conduct. Non-compliance with company policies, willful misconduct, breach of client trust, or unauthorized external representation of GENFREX may result in immediate revocation of this appointment.';
      doc.fontSize(8.5).font('Helvetica').fillColor(textGray).lineGap(1.5)
        .text(conductText, 55, p2Y, { width: 485, align: 'justify' });

      p2Y += 46;

      // Section: ACCEPTANCE
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryBlue).text('7. ACCEPTANCE & ACKNOWLEDGEMENT', 55, p2Y);
      p2Y += 14;
      const acceptText = template?.acceptanceTerms ||
        'Please signify your acceptance of this Trainee Appointment Letter and its incorporated terms by signing and returning the duplicate copy on or before the acceptance deadline mentioned herein.';
      doc.fontSize(8.5).font('Helvetica').fillColor(textGray).lineGap(1.5)
        .text(acceptText, 55, p2Y, { width: 485, align: 'justify' });

      p2Y += 40;

      // Authorized Signatories & Candidate Acceptance Grid
      doc.rect(55, p2Y, 485, 105).fill(lightBg);
      doc.rect(55, p2Y, 485, 105).strokeColor(borderColor).stroke();

      // Signatory 1: P.S. Dharshan
      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedGray).text('AUTHORIZED SIGNATORY', 70, p2Y + 10);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkNavy).text('P.S. Dharshan', 70, p2Y + 45);
      doc.fontSize(8).font('Helvetica').fillColor(textGray).text('Founder', 70, p2Y + 58);
      doc.fontSize(7.5).font('Helvetica').fillColor(mutedGray).text('GENFREX Ecosystem', 70, p2Y + 70);

      // Signatory 2: Deepak P
      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedGray).text('AUTHORIZED SIGNATORY', 230, p2Y + 10);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkNavy).text('Deepak P', 230, p2Y + 45);
      doc.fontSize(8).font('Helvetica').fillColor(textGray).text('Chief Operating Officer', 230, p2Y + 58);
      doc.fontSize(7.5).font('Helvetica').fillColor(mutedGray).text('GENFREX Ecosystem', 230, p2Y + 70);

      // Candidate Acceptance Signature
      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedGray).text('CANDIDATE ACCEPTANCE', 390, p2Y + 10);
      doc.strokeColor('#94A3B8').lineWidth(0.8).dash(3, { space: 3 })
        .moveTo(390, p2Y + 45).lineTo(525, p2Y + 45).stroke();
      doc.undash();
      doc.fontSize(8).font('Helvetica-Bold').fillColor(darkNavy).text(candidate.name || 'Candidate Signature', 390, p2Y + 52);
      doc.fontSize(7.5).font('Helvetica').fillColor(mutedGray).text('Signature & Date', 390, p2Y + 65);

      // --- PAGE NUMBERING ON ALL PAGES ---
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.strokeColor(borderColor).lineWidth(0.5).moveTo(55, 800).lineTo(540, 800).stroke();
        doc.fontSize(7.5).font('Helvetica').fillColor(mutedGray)
          .text('GENFREX Confidential  |  Unified Business Management Platform', 55, 808)
          .text(`Page ${i + 1} of ${range.count}`, 350, 808, { align: 'right', width: 190 });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          filePath,
          fileName,
          fileUrl: `/uploads/${fileName}`
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateAppointmentPDF
};
