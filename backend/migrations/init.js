const pool = require('../db');

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'recipient' CHECK (role IN ('admin', 'issuer', 'recipient')),
      created_at TIMESTAMP DEFAULT NOW()
    );

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
      organization VARCHAR(150),
      description TEXT,
      header_text TEXT,
      certificate_type_id INTEGER REFERENCES certificate_types(id) ON DELETE SET NULL,
      issue_date DATE DEFAULT CURRENT_DATE,
      certificate_code VARCHAR(50) NOT NULL UNIQUE,
      qr_code TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE certificates ADD COLUMN IF NOT EXISTS organization VARCHAR(150);
    ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE certificates ADD COLUMN IF NOT EXISTS header_text TEXT;
  `);

  // Courses system
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      certificate_type_id INTEGER REFERENCES certificate_types(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS course_lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      lesson_type VARCHAR(20) NOT NULL CHECK (lesson_type IN ('video','reading','quiz')),
      content TEXT,
      video_url VARCHAR(500),
      quiz_data JSONB,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS course_enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP,
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
      completed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, lesson_id)
    );
  `);

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

  const { rows: catRows } = await pool.query('SELECT COUNT(*) FROM categories');
  if (parseInt(catRows[0].count) === 0) {
    await pool.query(`
      INSERT INTO categories (name) VALUES
        ('Networking'),
        ('Artificial Intelligence'),
        ('Cloud Computing'),
        ('Software Development'),
        ('Cybersecurity')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  const { rows } = await pool.query('SELECT COUNT(*) FROM certificate_types');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO certificate_types (name, category_id, description) VALUES
        ('Certificate of Completion', NULL, 'General completion certificate'),
        ('IT Technical Certificate', (SELECT id FROM categories WHERE name='Networking'), 'IT and networking technical certificate'),
        ('Digital Online Certificate', (SELECT id FROM categories WHERE name='Software Development'), 'Online digital learning certificate')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  console.log('Database tables ready.');
};

module.exports = createTables;
