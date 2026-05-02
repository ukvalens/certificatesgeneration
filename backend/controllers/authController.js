const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const generateTokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, 'recipient']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    throw err;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

const getMe = async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [req.user.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const result = await pool.query('SELECT id, name, email FROM users WHERE email=$1', [email]);
  if (!result.rows.length) {
    return res.json({ message: 'Password reset link has been sent. Please check your inbox.' });
  }

  const user = result.rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = generateTokenHash(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at, created_at = NOW()`,
    [user.id, tokenHash, expiresAt]
  );

  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  const subject = 'Password reset request';
  const text = `Hello ${user.name},\n\nWe received a request to reset your password. If you made this request, click the link below:\n\n${resetLink}\n\nIf you did not request a password reset, you can ignore this email.`;
  const html = `<p>Hello ${user.name},</p><p>We received a request to reset your password. If you made this request, click the link below:</p><p><a href="${resetLink}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`;

  await sendMail({ to: user.email, subject, text, html });

  res.json({ message: 'Password reset link has been sent. Please check your inbox.' });
};

const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: 'Email, token, and password are required' });

  const userResult = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (!userResult.rows.length) return res.status(400).json({ error: 'Invalid reset token or email' });

  const tokenHash = generateTokenHash(token);
  const resetResult = await pool.query(
    `SELECT * FROM password_resets WHERE user_id=$1 AND token_hash=$2 AND expires_at > NOW()`,
    [userResult.rows[0].id, tokenHash]
  );

  if (!resetResult.rows.length) return res.status(400).json({ error: 'Invalid reset token or token expired' });

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashedPassword, userResult.rows[0].id]);
  await pool.query('DELETE FROM password_resets WHERE user_id=$1', [userResult.rows[0].id]);

  res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
