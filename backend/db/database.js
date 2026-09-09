const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { hashPassword } = require('../utils/password');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'edumanage.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      password_hash TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      dept TEXT NOT NULL,
      courses TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      roll TEXT UNIQUE NOT NULL COLLATE NOCASE,
      dept TEXT NOT NULL,
      class_code TEXT NOT NULL,
      year TEXT DEFAULT 'Year 1',
      gpa TEXT DEFAULT '3.50',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 4,
      max_capacity INTEGER NOT NULL DEFAULT 60
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target_class TEXT NOT NULL,
      sender_id TEXT,
      sender_name TEXT,
      sender_role TEXT DEFAULT 'teacher',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_reads (
      id TEXT PRIMARY KEY,
      notification_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(notification_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      lecture_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      class_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'late', 'absent')),
      date TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      student_id TEXT NOT NULL,
      due TEXT NOT NULL,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Submitted', 'Graded')),
      grade TEXT DEFAULT '-',
      submitted_file TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin if missing
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@edumanage.edu');
  if (!adminExists) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'edumanage';
    const adminHash = hashPassword(adminPassword);
    db.prepare(`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run('ADM-001', 'Dr. Sarah Jenkins', 'admin@edumanage.edu', 'admin', adminHash);
  }

  // Seed standard academic courses if empty
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  if (courseCount === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (code, name, dept, credits, max_capacity)
      VALUES (?, ?, ?, ?, ?)
    `);

    const standardCourses = [
      ['CS101', 'Computer Systems & Architecture', 'Computer Science', 4, 60],
      ['DS204', 'Machine Learning & Statistical Data', 'Data Science', 3, 50],
      ['CS302', 'Web Systems Engineering & Microservices', 'Computer Science', 4, 45],
      ['IT410', 'Cloud Infrastructure & DevOps Lab', 'Computer Science', 3, 40],
      ['BIO302', 'Molecular Genetics & Genomics', 'Biotechnology', 4, 50],
      ['BUS105', 'Financial Accounting Principles', 'Business Admin', 3, 70]
    ];

    for (const [code, name, dept, credits, maxCap] of standardCourses) {
      insertCourse.run(code, name, dept, credits, maxCap);
    }
  }
}

initSchema();

module.exports = db;
