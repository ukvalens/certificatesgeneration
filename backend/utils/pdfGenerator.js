const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const CATEGORY_STYLES = {
  Development: { bg: '#eef2ff', accent: '#3730a3' },
  Design: { bg: '#fdf2f8', accent: '#9d174d' },
  Business: { bg: '#fefce8', accent: '#92400e' },
  Marketing: { bg: '#ecfdf5', accent: '#0f766e' },
  Default: { bg: '#fbfcff', accent: '#1e40af' },
};

const CATEGORY_HEADERS = {
  Development: 'CERTIFICATE OF DEVELOPMENT',
  Design: 'CERTIFICATE OF DESIGN ACHIEVEMENT',
  Business: 'CERTIFICATE OF BUSINESS ACHIEVEMENT',
  Marketing: 'CERTIFICATE OF MARKETING ACHIEVEMENT',
  Default: 'CERTIFICATE OF ACHIEVEMENT',
};

const FALLBACK_ACCENTS = ['#2563eb', '#7c3aed', '#db2777', '#0f766e', '#b45309', '#047857', '#7c2d12', '#831843'];

const getStringHash = (text) => {
  return text.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
};

const getCategoryStyle = (category) => {
  if (!category) return CATEGORY_STYLES.Default;
  if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];

  const index = Math.abs(getStringHash(category)) % FALLBACK_ACCENTS.length;
  return {
    bg: '#f8fafc',
    accent: FALLBACK_ACCENTS[index],
  };
};

const getHeaderText = (category, headerText) => {
  if (headerText) return headerText;
  return CATEGORY_HEADERS[category] || CATEGORY_HEADERS.Default;
};

const generateCertificateCode = () => {
  return `CERT-${uuidv4().split('-')[0].toUpperCase()}`;
};

const generateQRCode = async (data) => {
  return await QRCode.toDataURL(data);
};

const generatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      bufferPages: true,
      font: 'Helvetica',
    });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;
    const margin = 40;
    const innerWidth = width - margin * 2;
    const categoryKey = certificateData.category || certificateData.certificate_type;
    const categoryStyle = getCategoryStyle(categoryKey);
    const headerText = getHeaderText(certificateData.category, certificateData.header_text);

    // Background and border
    doc.rect(0, 0, width, height).fill(categoryStyle.bg);
    doc.roundedRect(margin, margin, innerWidth, height - margin * 2, 18)
       .lineWidth(2)
       .stroke('#cbd5e1');

    // Top accent bar and title
    doc.rect(margin + 12, margin + 12, innerWidth - 24, 82).fill(categoryStyle.accent);
    doc.fillColor('#fff').fontSize(24).font('Helvetica-Bold')
       .text(headerText, margin + 12, margin + 28, { width: innerWidth - 24, align: 'center' });

    // Presented to text
    doc.fillColor('#475569').fontSize(14).font('Helvetica')
       .text('This is to certify that', margin, margin + 120, { width: innerWidth, align: 'center' });

    // Recipient name
    doc.fillColor('#0f172a').fontSize(44).font('Helvetica-Bold')
       .text(certificateData.user_name || 'Recipient Name', margin, margin + 150, { width: innerWidth, align: 'center' });

    // Achievement line
    doc.fillColor('#475569').fontSize(16).font('Helvetica')
       .text('has successfully completed', margin, margin + 220, { width: innerWidth, align: 'center' });

    // Certificate title
    doc.fillColor('#1e40af').fontSize(30).font('Helvetica-Bold')
       .text(certificateData.certificate_type || 'Certificate Type', margin, margin + 250, { width: innerWidth, align: 'center' });

    let detailY = margin + 310;

    // Description under name
    if (certificateData.description) {
      doc.fillColor('#475569').fontSize(13).font('Helvetica-Oblique')
         .text(certificateData.description, margin + 80, detailY, { width: innerWidth - 160, align: 'center' });
      detailY += 26;
    }

    // Course label
    if (certificateData.category) {
      doc.fillColor('#64748b').fontSize(14).font('Helvetica-Oblique')
         .text(`COURSE: ${certificateData.category}`, margin, detailY, { width: innerWidth, align: 'center' });
      detailY += 24;
    }

    // Details box
    const boxY = detailY + 18;
    doc.roundedRect(margin + 80, boxY, innerWidth - 160, 92, 10)
       .fill('#fff')
       .stroke('#e2e8f0');

    doc.fillColor('#334155').fontSize(12).font('Helvetica')
       .text(`Issued Date: ${certificateData.issue_date || ''}`, margin + 110, boxY + 16);
    doc.text(`Certificate Code: ${certificateData.certificate_code || ''}`, margin + 110, boxY + 36);

    // Signature image and line
    const signaturePath = path.resolve(__dirname, '..', '..', 'frontend', 'signature', 'signature.png');
    const sigX = margin + 100;
    const sigImageY = height - margin - 155;
    const sigLineY = height - margin - 80;
    const sigWidth = 220;

    if (doc && signaturePath) {
      try {
        if (require('fs').existsSync(signaturePath)) {
          doc.image(signaturePath, sigX, sigImageY, { width: sigWidth, height: 70 });
        }
      } catch (e) {
        console.error('Signature image error:', e.message);
      }
    }

    doc.moveTo(sigX, sigLineY)
       .lineTo(sigX + sigWidth, sigLineY)
       .lineWidth(1)
       .stroke('#94a3b8');

    doc.fillColor('#475569').fontSize(12).font('Helvetica')
       .text('Authorized Signature', sigX, sigLineY + 8, { width: sigWidth, align: 'center' });

    if (certificateData.organization) {
      doc.fillColor('#475569').fontSize(11).font('Helvetica-Oblique')
         .text(`Organization: ${certificateData.organization}`, sigX, sigLineY + 26, { width: sigWidth, align: 'center' });
    }

    // QR verify block
    if (certificateData.qr_code) {
      try {
        const qrImage = Buffer.from(certificateData.qr_code.split(',')[1], 'base64');
        doc.image(qrImage, width - margin - 120, height - margin - 160, { width: 100 });
        doc.fillColor('#475569').fontSize(10).font('Helvetica')
           .text('Scan to verify', width - margin - 120, height - margin - 48, { width: 100, align: 'center' });
      } catch (e) {
        console.error('QR image error:', e.message);
      }
    }

    doc.end();
  });
};

module.exports = { generateCertificateCode, generateQRCode, generatePDF };
