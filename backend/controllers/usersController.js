const pool = require('../db');
const bcrypt = require('bcryptjs');

const getAll = async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'issuer', 'recipient'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  if (parseInt(id) === req.user.id)
    return res.status(400).json({ error: 'Cannot change your own role' });
  const result = await pool.query(
    'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role',
    [role, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
};

const adminResetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'UPDATE users SET password=$1 WHERE id=$2 RETURNING id',
    [hashed, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Password updated successfully' });
};

const remove = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account' });
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ message: 'User deleted' });
};

module.exports = { getAll, updateRole, adminResetPassword, remove };
