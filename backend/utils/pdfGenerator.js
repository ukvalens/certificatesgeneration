const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateCertificateCode = () => {
  return `CERT-${uuidv4().split('-')[0].toUpperCase()}`;
};

const generateQRCode = async (data) => {
  return await QRCode.toDataURL(data);
};

const generatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f8ff');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#1e3a8a');
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke('#1e3a8a');

    doc.fontSize(40).fillColor('#1e3a8a').font('Helvetica-Bold')
       .text('CERTIFICATE', 0, 100, { align: 'center' });

    doc.fontSize(16).fillColor('#333')
       .text('This is to certify that', 0, 180, { align: 'center' });

    doc.fontSize(32).fillColor('#1e3a8a').font('Helvetica-Bold')
       .text(certificateData.user_name, 0, 220, { align: 'center' });

    doc.fontSize(16).fillColor('#333').font('Helvetica')
       .text('has successfully completed', 0, 280, { align: 'center' });

    doc.fontSize(24).fillColor('#1e3a8a').font('Helvetica-Bold')
       .text(certificateData.certificate_type, 0, 320, { align: 'center' });

    if (certificateData.category) {
      doc.fontSize(14).fillColor('#666')
         .text(`Category: ${certificateData.category}`, 0, 370, { align: 'center' });
    }

    doc.fontSize(12).fillColor('#333')
       .text(`Issue Date: ${certificateData.issue_date}`, 0, 420, { align: 'center' });

    doc.fontSize(10).fillColor('#666')
       .text(`Certificate Code: ${certificateData.certificate_code}`, 0, 450, { align: 'center' });

    if (certificateData.qr_code) {
      const qrImage = Buffer.from(certificateData.qr_code.split(',')[1], 'base64');
      doc.image(qrImage, doc.page.width - 130, doc.page.height - 130, { width: 80 });
    }

    doc.end();
  });
};

module.exports = { generateCertificateCode, generateQRCode, generatePDF };
