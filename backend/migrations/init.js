const pool = require('../db');

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS certificate_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(150) NOT NULL,
      email VARCHAR(150),
      certificate_type_id INTEGER REFERENCES certificate_types(id) ON DELETE SET NULL,
      issue_date DATE DEFAULT CURRENT_DATE,
      certificate_code VARCHAR(50) NOT NULL UNIQUE,
      qr_code TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add unique constraint to certificate_types if not exists
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'certificate_types_name_key'
      ) THEN
        DELETE FROM certificate_types WHERE id NOT IN (
          SELECT MIN(id) FROM certificate_types GROUP BY name
        );
        ALTER TABLE certificate_types ADD CONSTRAINT certificate_types_name_key UNIQUE (name);
      END IF;
    END $$;
  `);

  await pool.query(`
    INSERT INTO categories (name) VALUES
      ('Networking'),
      ('Artificial Intelligence'),
      ('Cloud Computing'),
      ('Software Development'),
      ('Cybersecurity')
    ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO certificate_types (name, category_id, description) VALUES
      ('Certificate of Completion', NULL, 'General completion certificate'),
      ('IT Technical Certificate', (SELECT id FROM categories WHERE name='Networking'), 'IT and networking technical certificate'),
      ('Digital Online Certificate', (SELECT id FROM categories WHERE name='Software Development'), 'Online digital learning certificate')
    ON CONFLICT (name) DO NOTHING;
  `);

  console.log('Database tables ready.');
};

module.exports = createTables;
