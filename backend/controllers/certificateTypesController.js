const pool = require('../db');

const getAll = async (req, res) => {
  const result = await pool.query(`
    SELECT ct.*, c.name AS category_name
    FROM certificate_types ct
    LEFT JOIN categories c ON ct.category_id = c.id
    ORDER BY ct.name
  `);
  res.json(result.rows);
};

const create = async (req, res) => {
  const { name, category_id, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = await pool.query(
    'INSERT INTO certificate_types (name, category_id, description) VALUES ($1, $2, $3) RETURNING *',
    [name, category_id || null, description || null]
  );
  res.status(201).json(result.rows[0]);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, category_id, description } = req.body;
  const result = await pool.query(
    'UPDATE certificate_types SET name=$1, category_id=$2, description=$3 WHERE id=$4 RETURNING *',
    [name, category_id || null, description || null, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const remove = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM certificate_types WHERE id=$1', [id]);
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, create, update, remove };
