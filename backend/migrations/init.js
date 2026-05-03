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

  // Seed courses
  const { rows: courseRows } = await pool.query('SELECT COUNT(*) FROM courses');
  if (parseInt(courseRows[0].count) === 0) {
    await pool.query(`
      INSERT INTO courses (title, description, category_id, certificate_type_id) VALUES
        ('Networking Fundamentals', 'Learn core networking concepts including protocols, IP addressing, and network devices.',
          (SELECT id FROM categories WHERE name='Networking'),
          (SELECT id FROM certificate_types WHERE name='IT Technical Certificate')),
        ('Introduction to Artificial Intelligence', 'Explore foundations of AI including machine learning, neural networks, and real-world applications.',
          (SELECT id FROM categories WHERE name='Artificial Intelligence'),
          (SELECT id FROM certificate_types WHERE name='Certificate of Completion')),
        ('Web Development Essentials', 'Master modern web development with HTML, CSS, JavaScript and REST APIs.',
          (SELECT id FROM categories WHERE name='Software Development'),
          (SELECT id FROM certificate_types WHERE name='Digital Online Certificate'))
      ON CONFLICT DO NOTHING;
    `);

    // ── Networking Fundamentals lessons ──
    await pool.query(`
      INSERT INTO course_lessons (course_id, title, lesson_type, content, video_url, position) VALUES
      ((SELECT id FROM courses WHERE title='Networking Fundamentals'), 'What is a Computer Network?', 'reading',
       'A computer network is a set of computers sharing resources located on or provided by network nodes.

Types of Networks:
- LAN (Local Area Network): Covers a small area like a home or office.
- WAN (Wide Area Network): Spans large areas, like the internet.
- MAN (Metropolitan Area Network): Covers a city or campus.

Key Concepts:
- Bandwidth: Maximum rate of data transfer across a network path.
- Latency: Time it takes for data to travel from source to destination.
- Topology: Arrangement of network devices (star, bus, ring, mesh).

Networks are built with hardware (routers, switches, cables) and software (protocols defining how data is transmitted).',
       NULL, 1),
      ((SELECT id FROM courses WHERE title='Networking Fundamentals'), 'IP Addressing and Subnetting', 'reading',
       'An IP address is a unique identifier assigned to each device on a network.

IPv4: 32-bit numbers written as four octets (e.g., 192.168.1.1).
IPv6: 128-bit numbers in hexadecimal (e.g., 2001:0db8::1).

Subnetting divides a network into smaller sub-networks:
- Subnet Mask: Determines network vs host portion (e.g., 255.255.255.0).
- CIDR Notation: Shorthand for subnet masks (e.g., /24).
- Private IP Ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.

Common Protocols:
- TCP: Reliable, connection-oriented.
- UDP: Fast, connectionless.
- HTTP/HTTPS: Web traffic.
- DNS: Resolves domain names to IP addresses.',
       NULL, 2),
      ((SELECT id FROM courses WHERE title='Networking Fundamentals'), 'Network Devices Explained', 'video',
       'This lesson covers routers, switches, hubs, and firewalls.

Router: Connects different networks and routes traffic using IP addresses.
Switch: Connects devices within the same network using MAC addresses.
Hub: Broadcasts data to all devices (outdated).
Firewall: Monitors and controls traffic based on security rules.',
       'https://www.youtube.com/watch?v=3uhA8bdz8gI', 3),
      ((SELECT id FROM courses WHERE title='Networking Fundamentals'), 'Networking Knowledge Check', 'quiz', NULL, NULL, 4);
    `);
    await pool.query(`
      UPDATE course_lessons SET quiz_data = $1
      WHERE title='Networking Knowledge Check'
      AND course_id=(SELECT id FROM courses WHERE title='Networking Fundamentals')`,
      [JSON.stringify({ questions: [
        { question: 'What does LAN stand for?', options: ['Large Area Network','Local Area Network','Linked Access Node','Layered Area Network'], answer: 1 },
        { question: 'Which protocol is connection-oriented and reliable?', options: ['UDP','HTTP','TCP','DNS'], answer: 2 },
        { question: 'What is the subnet mask for a /24 network?', options: ['255.255.0.0','255.0.0.0','255.255.255.0','255.255.255.128'], answer: 2 },
        { question: 'Which device connects different networks using IP addresses?', options: ['Switch','Hub','Firewall','Router'], answer: 3 }
      ]})]
    );

    // ── Introduction to AI lessons ──
    await pool.query(`
      INSERT INTO course_lessons (course_id, title, lesson_type, content, video_url, position) VALUES
      ((SELECT id FROM courses WHERE title='Introduction to Artificial Intelligence'), 'What is Artificial Intelligence?', 'reading',
       'Artificial Intelligence (AI) is the simulation of human intelligence by machines.

Core Areas:
- Machine Learning (ML): Systems that learn from data without explicit programming.
- Deep Learning: ML using neural networks with many layers.
- Natural Language Processing (NLP): Machines understanding human language.
- Computer Vision: Machines interpreting visual information.

Types of AI:
- Narrow AI: Designed for a specific task (e.g., chess engines, recommendations).
- General AI: Hypothetical human-level intelligence across all domains.

Real-world Applications:
- Virtual assistants (Siri, Alexa)
- Fraud detection in banking
- Medical image diagnosis
- Self-driving vehicles',
       NULL, 1),
      ((SELECT id FROM courses WHERE title='Introduction to Artificial Intelligence'), 'Machine Learning Basics', 'reading',
       'Machine Learning automates analytical model building from data.

Types of Machine Learning:
1. Supervised Learning: Trained on labeled data. Examples: spam detection, image classification.
2. Unsupervised Learning: Finds patterns in unlabeled data. Examples: customer segmentation.
3. Reinforcement Learning: Learns by trial and error using rewards. Examples: game-playing AI.

Key Concepts:
- Training Data: Dataset used to train the model.
- Features: Input variables used for prediction.
- Labels: Output variable the model predicts.
- Overfitting: Model performs well on training data but poorly on new data.
- Underfitting: Model too simple to capture patterns.',
       NULL, 2),
      ((SELECT id FROM courses WHERE title='Introduction to Artificial Intelligence'), 'AI in the Real World', 'video',
       'Watch how AI is transforming industries today.

Key Takeaways:
- AI is embedded in everyday tools like search engines and social media feeds.
- Healthcare AI detects diseases from scans faster than human doctors.
- AI ethics addresses bias, privacy, and accountability.',
       'https://www.youtube.com/watch?v=ad79nYk2keg', 3),
      ((SELECT id FROM courses WHERE title='Introduction to Artificial Intelligence'), 'AI Fundamentals Quiz', 'quiz', NULL, NULL, 4);
    `);
    await pool.query(`
      UPDATE course_lessons SET quiz_data = $1
      WHERE title='AI Fundamentals Quiz'
      AND course_id=(SELECT id FROM courses WHERE title='Introduction to Artificial Intelligence')`,
      [JSON.stringify({ questions: [
        { question: 'What is Machine Learning?', options: ['Programming with explicit rules','Systems that learn from data','A type of database','A networking protocol'], answer: 1 },
        { question: 'Which type of ML uses labeled training data?', options: ['Unsupervised Learning','Reinforcement Learning','Supervised Learning','Deep Learning'], answer: 2 },
        { question: 'What does NLP stand for?', options: ['Network Layer Protocol','Natural Language Processing','Neural Learning Program','Node Link Protocol'], answer: 1 },
        { question: 'Which AI application is used in self-driving cars?', options: ['NLP','Supervised Learning only','Computer Vision','Blockchain'], answer: 2 }
      ]})]
    );

    // ── Web Development Essentials lessons ──
    await pool.query(`
      INSERT INTO course_lessons (course_id, title, lesson_type, content, video_url, position) VALUES
      ((SELECT id FROM courses WHERE title='Web Development Essentials'), 'HTML & CSS Foundations', 'reading',
       'HTML (HyperText Markup Language) is the standard language for creating web pages.

Core HTML Elements:
- <html>: Root element. <head>: Metadata. <body>: Visible content.
- <h1>-<h6>: Headings. <p>: Paragraphs. <a href>: Links. <img src>: Images.
- <div> and <span>: Layout containers.

CSS controls visual presentation:
- Selectors: Target elements (p, .class, #id).
- Box Model: margin, border, padding, content.
- Flexbox: Arrange items in rows or columns.
- Grid: Two-dimensional layout system.
- Media Queries: Adapt layouts to screen sizes.',
       NULL, 1),
      ((SELECT id FROM courses WHERE title='Web Development Essentials'), 'JavaScript Essentials', 'reading',
       'JavaScript enables interactive and dynamic web content.

Core Concepts:
- Variables: let, const, var.
- Data Types: string, number, boolean, array, object.
- Functions: Reusable blocks of code.
- DOM Manipulation: Changing HTML/CSS via JavaScript.
- Events: Responding to user actions (click, input, submit).
- Fetch API: Making HTTP requests to servers.

Modern JavaScript (ES6+):
- Arrow functions: const fn = () => {}.
- Template literals: Hello ${name}.
- Destructuring: const { a, b } = obj.
- Async/Await: Handling asynchronous operations cleanly.

Popular Frameworks: React.js, Vue.js, Node.js.',
       NULL, 2),
      ((SELECT id FROM courses WHERE title='Web Development Essentials'), 'Building Your First Web App', 'video',
       'Follow along building a simple web application from scratch using HTML, CSS, and JavaScript.

Covered: project structure, linking files, DOM events, and deploying to the web.',
       'https://www.youtube.com/watch?v=G3e-cpL7ofc', 3),
      ((SELECT id FROM courses WHERE title='Web Development Essentials'), 'Web Development Quiz', 'quiz', NULL, NULL, 4);
    `);
    await pool.query(`
      UPDATE course_lessons SET quiz_data = $1
      WHERE title='Web Development Quiz'
      AND course_id=(SELECT id FROM courses WHERE title='Web Development Essentials')`,
      [JSON.stringify({ questions: [
        { question: 'What does HTML stand for?', options: ['Hyper Transfer Markup Language','HyperText Markup Language','High Text Machine Language','Hyper Tool Multi Language'], answer: 1 },
        { question: 'Which CSS property controls space inside an element?', options: ['margin','border','padding','spacing'], answer: 2 },
        { question: 'Which keyword declares a constant in JavaScript?', options: ['var','let','const','def'], answer: 2 },
        { question: 'What is React.js?', options: ['A database','A server-side language','A component-based UI library','A CSS framework'], answer: 2 }
      ]})]
    );
  }
};

module.exports = createTables;
