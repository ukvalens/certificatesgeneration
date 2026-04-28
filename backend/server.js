const express = require('express');
const cors = require('cors');
require('dotenv').config();
const createTables = require('./migrations/init');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/categories', require('./routes/categories'));
app.use('/api/certificate-types', require('./routes/certificateTypes'));
app.use('/api/certificates', require('./routes/certificates'));

app.get('/', (req, res) => {
  res.json({ message: 'Certificate System API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});
