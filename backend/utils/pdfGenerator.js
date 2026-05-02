const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const ACCENT_COLORS = ['#2563eb', '#7c3aed', '#0f766e', '#b45309', '#db2777', '#047857', '#1d4ed8', '#9333ea'];

const getAccent = (text) => {
  if (!text) return '#111f4d';
  const hash = text.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

const generateCertificateCode = () => `CERT-${uuidv4().split('-')[0].toUpperCase()}`;
const generateQRCode = async (data) => await QRCode.toDataURL(data);

const generatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', bufferPages: true });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;
    const accent = getAccent(certificateData.category || certificateData.certificate_type);
    const headerText = certificateData.header_text || 'CERTIFICATE OF ACHIEVEMENT';

    // ── Background ──────────────────────────────────────────────
    doc.rect(0, 0, width, height).fill('#fafafa');

    // Left decorative sidebar
    doc.rect(0, 0, 18, height).fill(accent);
    doc.rect(22, 0, 4, height).fill(accent).fillOpacity(0.3);

    // Right decorative sidebar
    doc.rect(width - 18, 0, 18, height).fill(accent);
    doc.rect(width - 26, 0, 4, height).fill(accent).fillOpacity(0.3);

    // Top bar
    doc.rect(0, 0, width, 10).fill(accent);
    // Bottom bar
    doc.rect(0, height - 10, width, 10).fill(accent);

    // Inner content border
    doc.fillOpacity(1);
    doc.rect(38, 20, width - 76, height - 40).lineWidth(1).stroke('#d1d5db');

    // ── Header area ─────────────────────────────────────────────
    // Accent header band
    doc.rect(38, 20, width - 76, 70).fill(accent);

    // Header title
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
       .text(headerText.toUpperCase(), 50, 38, { width: width - 100, align: 'center', characterSpacing: 3 });

    // ── Certificate Type badge ───────────────────────────────────
    if (certificateData.category) {
      const badgeText = certificateData.category.toUpperCase();
      const badgeW = 180;
      const badgeX = (width - badgeW) / 2;
      doc.roundedRect(badgeX, 102, badgeW, 26, 13).fill(accent).fillOpacity(0.12);
      doc.fillOpacity(1).fillColor(accent).fontSize(11).font('Helvetica-Bold')
         .text(badgeText, badgeX, 109, { width: badgeW, align: 'center', characterSpacing: 2 });
    }

    // ── Body ─────────────────────────────────────────────────────
    const bodyTop = certificateData.category ? 148 : 120;

    doc.fillColor('#6b7280').fontSize(13).font('Helvetica')
       .text('This is to certify that', 50, bodyTop, { width: width - 100, align: 'center' });

    // Recipient name with underline
    const nameY = bodyTop + 28;
    doc.fillColor('#111827').fontSize(46).font('Helvetica-Bold')
       .text(certificateData.user_name || 'Recipient Name', 50, nameY, { width: width - 100, align: 'center' });

    // Decorative line under name
    const lineY = nameY + 58;
    const lineW = 260;
    const lineX = (width - lineW) / 2;
    doc.moveTo(lineX, lineY).lineTo(lineX + lineW, lineY).lineWidth(2).strokeColor(accent).stroke();

    doc.fillColor('#6b7280').fontSize(13).font('Helvetica')
       .text('has successfully completed', 50, lineY + 12, { width: width - 100, align: 'center' });

    // Course name
    doc.fillColor(accent).fontSize(28).font('Helvetica-Bold')
       .text(certificateData.certificate_type || 'Course Name', 50, lineY + 36, { width: width - 100, align: 'center' });

    // Description
    if (certificateData.description) {
      doc.fillColor('#6b7280').fontSize(12).font('Helvetica-Oblique')
         .text(certificateData.description, 100, lineY + 80, { width: width - 200, align: 'center' });
    }

    // ── Footer row ───────────────────────────────────────────────
    const footerY = height - 115;

    // Divider
    doc.moveTo(50, footerY).lineTo(width - 50, footerY).lineWidth(0.5).strokeColor('#e5e7eb').stroke();

    // Signature block (left)
    const sigX = 80;
    const sigLineY = footerY + 52;
    const sigW = 200;

    const signaturePath = path.resolve(__dirname, '..', '..', 'frontend', 'signature', 'signature.png');
    if (fs.existsSync(signaturePath)) {
      try { doc.image(signaturePath, sigX, footerY + 8, { width: sigW, height: 44 }); } catch (e) {}
    }
    doc.moveTo(sigX, sigLineY).lineTo(sigX + sigW, sigLineY).lineWidth(1).strokeColor('#9ca3af').stroke();
    doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold')
       .text('Authorized Signature', sigX, sigLineY + 6, { width: sigW, align: 'center' });
    if (certificateData.organization) {
      doc.fillColor('#6b7280').fontSize(10).font('Helvetica')
         .text(certificateData.organization, sigX, sigLineY + 20, { width: sigW, align: 'center' });
    }

    // Issue date + code (center)
    const midX = width / 2 - 80;
    doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold').text('Issue Date', midX, footerY + 14, { width: 160, align: 'center' });
    doc.fillColor('#6b7280').fontSize(11).font('Helvetica').text(certificateData.issue_date || '', midX, footerY + 28, { width: 160, align: 'center' });
    doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold').text('Certificate Code', midX, footerY + 48, { width: 160, align: 'center' });
    doc.fillColor(accent).fontSize(11).font('Helvetica-Bold').text(certificateData.certificate_code || '', midX, footerY + 62, { width: 160, align: 'center' });

    // QR code (right)
    if (certificateData.qr_code) {
      try {
        const qrBuf = Buffer.from(certificateData.qr_code.split(',')[1], 'base64');
        doc.image(qrBuf, width - 140, footerY + 4, { width: 80 });
        doc.fillColor('#9ca3af').fontSize(9).font('Helvetica')
           .text('Scan to verify', width - 140, footerY + 86, { width: 80, align: 'center' });
      } catch (e) {}
    }

    doc.end();
  });
};

module.exports = { generateCertificateCode, generateQRCode, generatePDF };
