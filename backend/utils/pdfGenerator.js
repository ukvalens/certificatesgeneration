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
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', bufferPages: true, margin: 0 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // A4 landscape: 841.89 x 595.28 pt
    const W = doc.page.width;   // ~841.89
    const H = doc.page.height;  // ~595.28

    const accent = getAccent(certificateData.category || certificateData.certificate_type);
    const headerText = (certificateData.header_text || 'CERTIFICATE OF ACHIEVEMENT').toUpperCase();

    const pad = 32;          // outer padding
    const innerX = pad + 14; // content left edge
    const innerW = W - (pad + 14) * 2; // content width

    // ── Background ──────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill('#ffffff');

    // Outer border
    doc.rect(pad, pad, W - pad * 2, H - pad * 2).lineWidth(2).strokeColor(accent).stroke();
    // Inner border
    doc.rect(pad + 6, pad + 6, W - (pad + 6) * 2, H - (pad + 6) * 2).lineWidth(0.5).strokeColor(accent).fillOpacity(0).stroke();
    doc.fillOpacity(1);

    // Corner ornaments
    const orn = 18;
    [[pad + 2, pad + 2], [W - pad - 2 - orn, pad + 2], [pad + 2, H - pad - 2 - orn], [W - pad - 2 - orn, H - pad - 2 - orn]].forEach(([x, y]) => {
      doc.rect(x, y, orn, orn).fill(accent);
    });

    // ── Header band ─────────────────────────────────────────────
    const headerH = 64;
    const headerY = pad + 14;
    doc.rect(innerX, headerY, innerW, headerH).fill(accent);

    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold')
       .text(headerText, innerX, headerY + (headerH / 2) - 12, { width: innerW, align: 'center', characterSpacing: 4 });

    // ── Certificate Type badge ───────────────────────────────────
    let curY = headerY + headerH + 14;

    if (certificateData.category) {
      const badgeW = Math.min(220, innerW * 0.35);
      const badgeH = 22;
      const badgeX = (W - badgeW) / 2;
      doc.roundedRect(badgeX, curY, badgeW, badgeH, 11).fill(accent);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
         .text(certificateData.category.toUpperCase(), badgeX, curY + 6, { width: badgeW, align: 'center', characterSpacing: 2 });
      curY += badgeH + 12;
    } else {
      curY += 8;
    }

    // ── "This is to certify that" ────────────────────────────────
    doc.fillColor('#6b7280').fontSize(12).font('Helvetica')
       .text('This is to certify that', innerX, curY, { width: innerW, align: 'center' });
    curY += 20;

    // ── Recipient name ───────────────────────────────────────────
    const nameFontSize = 40;
    doc.fillColor('#111827').fontSize(nameFontSize).font('Helvetica-Bold')
       .text(certificateData.user_name || 'Recipient Name', innerX, curY, { width: innerW, align: 'center' });
    curY += nameFontSize + 6;

    // Decorative underline
    const lineW = 240;
    const lineX = (W - lineW) / 2;
    doc.moveTo(lineX, curY).lineTo(lineX + lineW, curY).lineWidth(1.5).strokeColor(accent).stroke();
    curY += 12;

    // ── "has successfully completed" ────────────────────────────
    doc.fillColor('#6b7280').fontSize(12).font('Helvetica')
       .text('has successfully completed', innerX, curY, { width: innerW, align: 'center' });
    curY += 20;

    // ── Course name ──────────────────────────────────────────────
    doc.fillColor(accent).fontSize(26).font('Helvetica-Bold')
       .text(certificateData.certificate_type || 'Course Name', innerX, curY, { width: innerW, align: 'center' });
    curY += 34;

    // ── Description ──────────────────────────────────────────────
    if (certificateData.description) {
      doc.fillColor('#6b7280').fontSize(10).font('Helvetica-Oblique')
         .text(certificateData.description, innerX + 60, curY, { width: innerW - 120, align: 'center' });
      curY += 18;
    }

    // ── Footer ───────────────────────────────────────────────────
    // Fixed footer height from bottom
    const footerH = 90;
    const footerY = H - pad - 14 - footerH;

    // Footer divider
    doc.moveTo(innerX, footerY).lineTo(innerX + innerW, footerY).lineWidth(0.5).strokeColor('#d1d5db').stroke();

    // Three columns: signature | date+code | QR
    const col = innerW / 3;

    // — Signature (left col)
    const sigX = innerX + 10;
    const sigW = col - 20;
    const sigLineY = footerY + 54;
    const signaturePath = path.resolve(__dirname, '..', '..', 'frontend', 'signature', 'signature.png');
    if (fs.existsSync(signaturePath)) {
      try { doc.image(signaturePath, sigX, footerY + 8, { width: sigW, height: 40, fit: [sigW, 40], align: 'center' }); } catch (e) {}
    }
    doc.moveTo(sigX, sigLineY).lineTo(sigX + sigW, sigLineY).lineWidth(0.8).strokeColor('#9ca3af').stroke();
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold')
       .text('Authorized Signature', sigX, sigLineY + 5, { width: sigW, align: 'center' });
    if (certificateData.organization) {
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica')
         .text(certificateData.organization, sigX, sigLineY + 17, { width: sigW, align: 'center' });
    }

    // — Date + Code (center col)
    const midX = innerX + col + 10;
    const midW = col - 20;
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Issue Date', midX, footerY + 12, { width: midW, align: 'center' });
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(certificateData.issue_date || '', midX, footerY + 24, { width: midW, align: 'center' });
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Certificate Code', midX, footerY + 44, { width: midW, align: 'center' });
    doc.fillColor(accent).fontSize(10).font('Helvetica-Bold').text(certificateData.certificate_code || '', midX, footerY + 56, { width: midW, align: 'center' });

    // — QR code (right col)
    if (certificateData.qr_code) {
      try {
        const qrBuf = Buffer.from(certificateData.qr_code.split(',')[1], 'base64');
        const qrSize = 68;
        const qrX = innerX + col * 2 + (col - qrSize) / 2;
        doc.image(qrBuf, qrX, footerY + 4, { width: qrSize, height: qrSize });
        doc.fillColor('#9ca3af').fontSize(8).font('Helvetica')
           .text('Scan to verify', qrX, footerY + qrSize + 6, { width: qrSize, align: 'center' });
      } catch (e) {}
    }

    doc.end();
  });
};

module.exports = { generateCertificateCode, generateQRCode, generatePDF };
