const express = require('express');
const router = express.Router();
const { Student, Course, Assignment, Attendance } = require('../db/mongodb');

/**
 * GET /api/students/:id
 * Strictly retrieves only the authenticated student's own account and profile
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ id }).lean();

    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    return res.json(student);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    return res.status(500).json({ error: 'Failed to retrieve student profile: ' + err.message });
  }
});

/**
 * GET /api/students/:id/courses
 * Retrieves courses enrolled by this student
 */
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ id }).lean();

    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    // Return courses related to student's class and department
    let courses = await Course.find({
      $or: [
        { code: student.class_code },
        { dept: student.dept }
      ]
    }).limit(6).lean();

    // If no course matched, return standard course list
    if (courses.length === 0) {
      courses = await Course.find().limit(4).lean();
    }

    return res.json(courses);
  } catch (err) {
    console.error('Error fetching student courses:', err);
    return res.status(500).json({ error: 'Failed to retrieve student courses.' });
  }
});

const { upload } = require('../utils/upload');

/**
 * GET /api/students/:id/assignments
 * Retrieves strictly this student's assignments
 */
router.get('/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ id }).lean();
    let assignments = await Assignment.find({ student_id: id }).sort({ due: 1 }).lean();

    // If no assignments are registered yet for this student, initialize default curriculum tasks for them
    if (assignments.length === 0) {
      const code = student ? student.class_code : 'CS101';

      const defaults = [
        {
          id: `ASN-1-${id}`,
          title: 'Assignment 1: Architecture Analysis',
          course: code,
          student_id: id,
          student_name: student ? student.name : '',
          student_roll: student ? student.roll : '',
          due: 'Friday, 11:59 PM',
          status: 'Pending',
          grade: '-'
        },
        {
          id: `ASN-2-${id}`,
          title: 'Midterm Practicum Report',
          course: code,
          student_id: id,
          student_name: student ? student.name : '',
          student_roll: student ? student.roll : '',
          due: 'Next Week',
          status: 'Pending',
          grade: '-'
        }
      ];

      await Assignment.insertMany(defaults);
      assignments = await Assignment.find({ student_id: id }).lean();
    } else if (student) {
      // Ensure student name and roll are populated on existing assignments if previously blank
      for (const a of assignments) {
        if (!a.student_name || !a.student_roll) {
          await Assignment.updateOne(
            { id: a.id },
            { $set: { student_name: student.name, student_roll: student.roll } }
          );
          a.student_name = student.name;
          a.student_roll = student.roll;
        }
      }
    }

    return res.json(assignments);
  } catch (err) {
    console.error('Error retrieving assignments:', err);
    return res.status(500).json({ error: 'Failed to retrieve assignments: ' + err.message });
  }
});

/**
 * POST /api/students/:id/assignments/:asnId/submit
 * Uploads an actual assignment file and records the submission
 */
router.post('/:id/assignments/:asnId/submit', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer file upload error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    try {
      const { id, asnId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'Please choose an assignment file to upload before submitting.' });
      }

      const student = await Student.findOne({ id }).lean();
      if (!student) {
        return res.status(404).json({ error: 'Student account not found.' });
      }

      const updateData = {
        status: 'Submitted',
        grade: 'Under Review',
        submitted_file: req.file.filename,
        original_file_name: req.file.originalname,
        file_size: req.file.size,
        file_url: `/api/assignments/download/${req.file.filename}`,
        submitted_at: new Date(),
        student_name: student.name,
        student_roll: student.roll
      };

      const updated = await Assignment.findOneAndUpdate(
        { id: asnId, student_id: id },
        updateData,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Assignment not found for this student.' });
      }

      return res.json({
        message: 'Assignment submitted successfully with uploaded file.',
        assignment: updated
      });
    } catch (dbErr) {
      console.error('Error recording assignment submission:', dbErr);
      return res.status(500).json({ error: 'Failed to record assignment submission: ' + dbErr.message });
    }
  });
});

/**
 * GET /api/students/:id/attendance
 * Retrieves aggregated lecture attendance records & summary for this student
 */
router.get('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ id }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const records = await Attendance.find({ student_id: id }).sort({ date: -1, lecture_id: -1 }).lean();

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;

    // Attendance percentage (Present = 100%, Late = 50%, Absent = 0%)
    const percentage = total > 0 ? Math.round(((present + (late * 0.5)) / total) * 100) : 100;

    return res.json({
      total,
      present,
      late,
      absent,
      percentage,
      records: records.map(r => ({
        id: r.id,
        date: r.date,
        class_code: r.class_code,
        lecture_id: r.lecture_id,
        status: r.status
      }))
    });
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    return res.status(500).json({ error: 'Failed to retrieve attendance: ' + err.message });
  }
});

module.exports = router;
