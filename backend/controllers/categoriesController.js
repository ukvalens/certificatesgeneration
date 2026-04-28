const pool = require('../db');

const getAll = async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(result.rows);
};

const create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Category already exists' });
    throw err;
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await pool.query(
    'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *',
    [name, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const remove = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, create, update, remove };
