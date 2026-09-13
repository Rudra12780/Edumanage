const express = require('express');
const router = express.Router();
const { User, Student, Attendance, Course, Assignment, Teacher } = require('../db/mongodb');
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

    // Automatically determine department from course/class if not explicitly provided
    let studentDept = (dept || '').trim();
    if (!studentDept && class_code) {
      const course = await Course.findOne({ code: new RegExp(`^${class_code.trim()}$`, 'i') });
      if (course && course.dept) {
        studentDept = course.dept;
      }
    }
    if (!studentDept) {
      const c = (class_code || '').trim().toUpperCase();
      if (c.startsWith('DS')) studentDept = 'Data Science';
      else if (c.startsWith('BIO')) studentDept = 'Biotechnology';
      else if (c.startsWith('BUS')) studentDept = 'Business Admin';
      else studentDept = 'Computer Science';
    }

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
        dept: studentDept,
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
    const { classCode, lectureId, date, allLectures } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    const filter = {
      class_code: new RegExp(`^${(classCode || 'CS101').trim()}$`, 'i'),
      date: today
    };

    if (lectureId && lectureId !== 'ALL' && !allLectures) {
      filter.lecture_id = lectureId.trim();
      const records = await Attendance.find(filter).lean();
      const map = {};
      for (const r of records) {
        map[r.student_id] = r.status;
      }
      return res.json(map);
    }

    // Group by lecture_id for all lectures of this class on the date
    const records = await Attendance.find(filter).lean();
    const grouped = {
      'LEC-1': {},
      'LEC-2': {},
      'LEC-3': {},
      'LEC-4': {}
    };
    for (const r of records) {
      if (!grouped[r.lecture_id]) {
        grouped[r.lecture_id] = {};
      }
      grouped[r.lecture_id][r.student_id] = r.status;
    }
    return res.json(grouped);
  } catch (err) {
    console.error('Error loading attendance:', err);
    return res.status(500).json({ error: 'Failed to load attendance: ' + err.message });
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

/**
 * GET /api/teachers/assignments
 * List submissions for a specific class/course, restricted to assigned faculty
 */
router.get('/assignments', async (req, res) => {
  try {
    const { classCode, teacherId } = req.query;

    if (!classCode) {
      return res.status(400).json({ error: 'classCode query parameter is required.' });
    }

    const cleanClass = classCode.trim();

    // Verify faculty assignment if teacherId provided
    if (teacherId) {
      const teacher = await Teacher.findOne({ id: teacherId }).lean();
      if (teacher && teacher.courses) {
        const assignedList = teacher.courses.toUpperCase();
        const targetClass = cleanClass.toUpperCase();
        // Check if teacher is assigned to this course or teaches all
        const isAssigned = assignedList.includes(targetClass) || assignedList === 'ALL';
        if (!isAssigned) {
          return res.status(403).json({
            error: `Access restricted: You are not the assigned faculty instructor for class ${cleanClass}. (Your assigned courses: ${teacher.courses})`,
            notAssigned: true,
            assignedCourses: teacher.courses
          });
        }
      }
    }

    // Retrieve all assignments for this course
    const assignments = await Assignment.find({
      course: new RegExp(`^${cleanClass}$`, 'i')
    }).sort({ submitted_at: -1, due: 1 }).lean();

    // Enrich student info if missing
    for (const a of assignments) {
      if (!a.student_name || !a.student_roll) {
        const student = await Student.findOne({ id: a.student_id }).lean();
        if (student) {
          a.student_name = student.name;
          a.student_roll = student.roll;
          await Assignment.updateOne(
            { id: a.id },
            { $set: { student_name: student.name, student_roll: student.roll } }
          );
        }
      }
    }

    return res.json(assignments);
  } catch (err) {
    console.error('Error fetching teacher assignments:', err);
    return res.status(500).json({ error: 'Failed to retrieve assignment submissions: ' + err.message });
  }
});

/**
 * PATCH /api/teachers/assignments/:id/grade
 * Review and grade a student's submitted assignment
 */
router.patch('/assignments/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback, status } = req.body;

    const updated = await Assignment.findOneAndUpdate(
      { id: id },
      {
        grade: grade || 'A',
        feedback: feedback !== undefined ? feedback : '',
        status: status || 'Graded',
        graded_at: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Assignment record not found.' });
    }

    return res.json({
      message: 'Assignment graded successfully.',
      assignment: updated
    });
  } catch (err) {
    console.error('Error grading assignment:', err);
    return res.status(500).json({ error: 'Failed to update assignment grade: ' + err.message });
  }
});

module.exports = router;
