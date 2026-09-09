const express = require('express');
const router = express.Router();
const { User, Student, Attendance } = require('../db/mongodb');
const { hashPassword, isPasswordUnique } = require('../utils/password');

/**
 * GET /api/teachers/students
 * List students enrolled in a specific class or all
 */
router.get('/students', async (req, res) => {
  try {
    const { classCode } = req.query;

    const filter = {};
    if (classCode && classCode !== 'ALL') {
      filter.class_code = new RegExp(`^${classCode.trim()}$`, 'i');
    }

    const students = await Student.find(filter).sort({ roll: 1 }).lean();
    return res.json(students);
  } catch (err) {
    console.error('Error fetching students roster:', err);
    return res.status(500).json({ error: 'Failed to retrieve students roster: ' + err.message });
  }
});

/**
 * POST /api/teachers/students
 * Teacher enrolls a student with a manual, unique password
 */
router.post('/students', async (req, res) => {
  try {
    const { name, email, roll, class_code, dept, year, gpa, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanRoll = (roll || `22CS${Math.floor(10 + Math.random() * 90)}`).trim().toUpperCase();

    // Validate email format
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'A student with this institutional email already exists.' });
    }

    // Check if roll already exists
    const existingRoll = await Student.findOne({ roll: cleanRoll });
    if (existingRoll) {
      return res.status(400).json({ error: 'Roll number already registered.' });
    }

    // Check password uniqueness across all accounts in the system
    const unique = await isPasswordUnique(cleanPassword);
    if (!unique) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }

    const newId = `STU-${Math.floor(100 + Math.random() * 900)}`;
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
        status: 'Active'
      });

      return res.status(201).json({
        message: 'Student enrolled successfully with unique credentials.',
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
    console.error('Error enrolling student:', err);
    if (err.message && err.message.includes('password_hash')) {
      return res.status(400).json({ error: 'Invalid or already used password.' });
    }
    return res.status(500).json({ error: 'Failed to enroll student: ' + err.message });
  }
});

/**
 * GET /api/teachers/attendance
 * Get attendance records for a class & lecture
 */
router.get('/attendance', async (req, res) => {
  try {
    const { classCode, lectureId, date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    const records = await Attendance.find({
      class_code: classCode || 'CS101',
      lecture_id: lectureId || 'LEC-1',
      date: today
    }).lean();

    const map = {};
    for (const r of records) {
      map[r.student_id] = r.status;
    }
    return res.json(map);
  } catch (err) {
    console.error('Error loading attendance:', err);
    return res.status(500).json({ error: 'Failed to load attendance.' });
  }
});

/**
 * POST /api/teachers/attendance
 * Save attendance records for a lecture
 */
router.post('/attendance', async (req, res) => {
  try {
    const { classCode, lectureId, records, date } = req.body;

    if (!classCode || !lectureId || !records) {
      return res.status(400).json({ error: 'classCode, lectureId, and records are required.' });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    for (const [studentId, status] of Object.entries(records)) {
      const recordId = `${classCode}_${lectureId}_${studentId}_${attendanceDate}`;
      await Attendance.findOneAndUpdate(
        { id: recordId },
        {
          id: recordId,
          lecture_id: lectureId,
          student_id: studentId,
          class_code: classCode,
          status,
          date: attendanceDate
        },
        { upsert: true, new: true }
      );
    }

    return res.json({ message: 'Attendance records saved successfully.' });
  } catch (err) {
    console.error('Error saving attendance:', err);
    return res.status(500).json({ error: 'Failed to save attendance: ' + err.message });
  }
});

module.exports = router;
