const pool = require('../db');
const { generateCertificateCode, generateQRCode, generatePDF } = require('../utils/pdfGenerator');

const getAll = async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, ct.name AS certificate_type, cat.name AS category
    FROM certificates c
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    LEFT JOIN categories cat ON ct.category_id = cat.id
    ORDER BY c.created_at DESC
  `);
  res.json(result.rows);
};

const getOne = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`
    SELECT c.*, ct.name AS certificate_type, cat.name AS category
    FROM certificates c
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    LEFT JOIN categories cat ON ct.category_id = cat.id
    WHERE c.id = $1
  `, [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const verify = async (req, res) => {
  const { code } = req.params;
  const result = await pool.query(`
    SELECT c.*, ct.name AS certificate_type, cat.name AS category
    FROM certificates c
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    LEFT JOIN categories cat ON ct.category_id = cat.id
    WHERE c.certificate_code = $1
  `, [code]);
  if (!result.rows.length) return res.status(404).json({ error: 'Certificate not found' });
  res.json(result.rows[0]);
};

const create = async (req, res) => {
  const { user_name, email, certificate_type_id, issue_date } = req.body;
  if (!user_name || !certificate_type_id) {
    return res.status(400).json({ error: 'user_name and certificate_type_id are required' });
  }

  const certificate_code = generateCertificateCode();
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificate_code}`;
  const qr_code = await generateQRCode(verifyUrl);

  const result = await pool.query(
    `INSERT INTO certificates (user_name, email, certificate_type_id, issue_date, certificate_code, qr_code)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_name, email || null, certificate_type_id, issue_date || new Date(), certificate_code, qr_code]
  );
  res.status(201).json(result.rows[0]);
};

const download = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`
    SELECT c.*, ct.name AS certificate_type, cat.name AS category
    FROM certificates c
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    LEFT JOIN categories cat ON ct.category_id = cat.id
    WHERE c.id = $1
  `, [id]);

  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });

  const cert = result.rows[0];
  const pdfBuffer = await generatePDF({
    user_name: cert.user_name,
    certificate_type: cert.certificate_type,
    category: cert.category,
    issue_date: new Date(cert.issue_date).toLocaleDateString(),
    certificate_code: cert.certificate_code,
    qr_code: cert.qr_code,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificate_code}.pdf`);
  res.send(pdfBuffer);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { user_name, email, certificate_type_id, issue_date } = req.body;
  const result = await pool.query(
    `UPDATE certificates SET user_name=$1, email=$2, certificate_type_id=$3, issue_date=$4 WHERE id=$5 RETURNING *`,
    [user_name, email || null, certificate_type_id, issue_date, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const remove = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM certificates WHERE id=$1', [id]);
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, getOne, verify, create, update, download, remove };
