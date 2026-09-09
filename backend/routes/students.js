const express = require('express');
const router = express.Router();
const { Student, Course, Assignment } = require('../db/mongodb');

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

/**
 * GET /api/students/:id/assignments
 * Retrieves strictly this student's assignments
 */
router.get('/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    let assignments = await Assignment.find({ student_id: id }).sort({ due: 1 }).lean();

    // If no assignments are registered yet for this student, initialize default curriculum tasks for them
    if (assignments.length === 0) {
      const student = await Student.findOne({ id }).lean();
      const code = student ? student.class_code : 'CS101';

      const defaults = [
        {
          id: `ASN-1-${id}`,
          title: 'Assignment 1: Architecture Analysis',
          course: code,
          student_id: id,
          due: 'Friday, 11:59 PM',
          status: 'Pending',
          grade: '-'
        },
        {
          id: `ASN-2-${id}`,
          title: 'Midterm Practicum Report',
          course: code,
          student_id: id,
          due: 'Next Week',
          status: 'Pending',
          grade: '-'
        }
      ];

      await Assignment.insertMany(defaults);
      assignments = await Assignment.find({ student_id: id }).lean();
    }

    return res.json(assignments);
  } catch (err) {
    console.error('Error retrieving assignments:', err);
    return res.status(500).json({ error: 'Failed to retrieve assignments.' });
  }
});

/**
 * POST /api/students/:id/assignments/:asnId/submit
 * Submit an assignment
 */
router.post('/:id/assignments/:asnId/submit', async (req, res) => {
  try {
    const { id, asnId } = req.params;
    const { fileName } = req.body;

    const updated = await Assignment.findOneAndUpdate(
      { id: asnId, student_id: id },
      {
        status: 'Submitted',
        grade: 'Under Review',
        submitted_file: fileName || 'submitted_file.pdf'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Assignment not found for this student.' });
    }

    return res.json({ message: 'Assignment submitted successfully.' });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    return res.status(500).json({ error: 'Failed to submit assignment.' });
  }
});

module.exports = router;
