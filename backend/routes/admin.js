const express = require('express');
const router = express.Router();
const { User, Teacher, Student, Course } = require('../db/mongodb');
const { hashPassword, isPasswordUnique } = require('../utils/password');

/**
 * GET /api/admin/teachers
 * List all faculty members
 */
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ created_at: -1 }).lean();
    
    // Attach student count for each teacher's department
    const enriched = await Promise.all(
      teachers.map(async (t) => {
        const studentCount = await Student.countDocuments({ dept: t.dept });
        return {
          ...t,
          students: studentCount
        };
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    return res.status(500).json({ error: 'Failed to retrieve faculty records.' });
  }
});

/**
 * POST /api/admin/teachers
 * Register a new faculty teacher with manual, unique password
 */
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, dept, courses, status, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Validate institutional email format
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this institutional email already exists.' });
    }

    // Check password uniqueness across all accounts in the system
    const unique = await isPasswordUnique(cleanPassword);
    if (!unique) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }

    const newId = `FAC-${Math.floor(100 + Math.random() * 900)}`;
    const passHash = hashPassword(cleanPassword);

    try {
      await User.create({
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        role: 'teacher',
        password_hash: passHash
      });

      const teacher = await Teacher.create({
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        dept: dept || 'Computer Science',
        courses: courses || 'CS101',
        status: status || 'Active'
      });

      return res.status(201).json({
        message: 'Teacher registered successfully.',
        teacher
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        if (createErr.keyPattern && createErr.keyPattern.password_hash) {
          return res.status(400).json({ error: 'Invalid or already used password.' });
        }
        if (createErr.keyPattern && createErr.keyPattern.email) {
          return res.status(400).json({ error: 'A user with this institutional email already exists.' });
        }
      }
      throw createErr;
    }
  } catch (err) {
    console.error('Error registering teacher:', err);
    if (err.message && err.message.includes('password_hash')) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }
    return res.status(500).json({ error: 'Failed to register teacher: ' + err.message });
  }
});

/**
 * GET /api/admin/students
 * List all students in the system
 */
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ created_at: -1 }).lean();
    return res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ error: 'Failed to retrieve students.' });
  }
});

/**
 * POST /api/admin/students
 * Admin registers student with manual, unique password
 */
router.post('/students', async (req, res) => {
  try {
    const { name, email, roll, dept, class_code, year, gpa, status, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanRoll = (roll || `22CS${Math.floor(10 + Math.random() * 90)}`).trim().toUpperCase();

    // Check email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'A student with this institutional email already exists.' });
    }

    // Check roll
    const existingRoll = await Student.findOne({ roll: cleanRoll });
    if (existingRoll) {
      return res.status(400).json({ error: 'Student roll number already in use.' });
    }

    // Check password uniqueness across all accounts
    const unique = await isPasswordUnique(cleanPassword);
    if (!unique) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }

    const newId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const passHash = hashPassword(cleanPassword);

    try {
      await User.create({
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        role: 'student',
        password_hash: passHash
      });

      const student = await Student.create({
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        roll: cleanRoll,
        dept: dept || 'Computer Science',
        class_code: class_code || 'CS101',
        year: year || 'Year 1',
        gpa: gpa || '3.50',
        status: status || 'Active'
      });

      return res.status(201).json({
        message: 'Student registered successfully.',
        student
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        if (createErr.keyPattern && createErr.keyPattern.password_hash) {
          return res.status(400).json({ error: 'Invalid or already used password.' });
        }
        if (createErr.keyPattern && createErr.keyPattern.email) {
          return res.status(400).json({ error: 'A student with this institutional email already exists.' });
        }
      }
      throw createErr;
    }
  } catch (err) {
    console.error('Error registering student:', err);
    if (err.message && err.message.includes('password_hash')) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }
    return res.status(500).json({ error: 'Failed to register student: ' + err.message });
  }
});

/**
 * PATCH /api/admin/students/:id/status
 * Update student academic status (Active, Probation, Inactive)
 */
router.patch('/students/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Probation', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Active, Probation, or Inactive.' });
    }

    const updated = await Student.findOneAndUpdate({ id }, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.json({ message: 'Status updated successfully.', id, status });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ error: 'Failed to update student status.' });
  }
});

/**
 * GET /api/admin/courses
 * List campus courses with enrolled counts
 */
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().lean();
    const enriched = await Promise.all(
      courses.map(async (c) => {
        const count = await Student.countDocuments({ class_code: c.code });
        return {
          code: c.code,
          name: c.name,
          dept: c.dept,
          credits: c.credits,
          max: c.max_capacity,
          enrolled: count
        };
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ error: 'Failed to retrieve courses.' });
  }
});

module.exports = router;
