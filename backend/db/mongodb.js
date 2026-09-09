const mongoose = require('mongoose');
const { hashPassword } = require('../utils/password');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://patelrudrabrij41_db_user:iVeqQeqjhbrzKiMQ@cluster0.2bdjxod.mongodb.net/edumanage?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  role: { type: String, required: true, enum: ['admin', 'teacher', 'student'] },
  password_hash: { type: String, required: true, unique: true, index: true },
  created_at: { type: Date, default: Date.now }
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  dept: { type: String, required: true, trim: true },
  courses: { type: String, required: true, trim: true },
  status: { type: String, default: 'Active' },
  created_at: { type: Date, default: Date.now }
});

// Student Schema
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  roll: { type: String, required: true, unique: true, trim: true, index: true },
  dept: { type: String, required: true, trim: true },
  class_code: { type: String, required: true, trim: true, index: true },
  year: { type: String, default: 'Year 1' },
  gpa: { type: String, default: '3.50' },
  status: { type: String, default: 'Active' },
  created_at: { type: Date, default: Date.now }
});

// Course Schema
const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  dept: { type: String, required: true, trim: true },
  credits: { type: Number, default: 4 },
  max_capacity: { type: Number, default: 60 }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  target_class: { type: String, required: true, trim: true, index: true },
  sender_id: { type: String, default: null },
  sender_name: { type: String, default: 'Faculty Instructor' },
  sender_role: { type: String, default: 'teacher' },
  created_at: { type: Date, default: Date.now }
});

// Notification Reads Schema (tracking which user has read which notification)
const notificationReadSchema = new mongoose.Schema({
  notification_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true, index: true },
  read_at: { type: Date, default: Date.now }
});
notificationReadSchema.index({ notification_id: 1, user_id: 1 }, { unique: true });

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  lecture_id: { type: String, required: true, index: true },
  student_id: { type: String, required: true, index: true },
  class_code: { type: String, required: true, index: true },
  status: { type: String, required: true, enum: ['present', 'late', 'absent'] },
  date: { type: String, required: true, index: true }
});

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  student_id: { type: String, required: true, index: true },
  due: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Submitted', 'Graded'], default: 'Pending' },
  grade: { type: String, default: '-' },
  submitted_file: { type: String, default: null }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const NotificationRead = mongoose.models.NotificationRead || mongoose.model('NotificationRead', notificationReadSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('Connected successfully to MongoDB Atlas Cluster0 (edumanage database)');

    // Ensure all unique indexes are built in MongoDB
    await Promise.all([
      User.init(),
      Teacher.init(),
      Student.init(),
      Course.init(),
      Notification.init(),
      NotificationRead.init(),
      Attendance.init(),
      Assignment.init()
    ]);

    // Seed default admin if none exists
    const adminUser = await User.findOne({ email: 'admin@edumanage.edu' });
    if (!adminUser) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'edumanage';
      const adminHash = hashPassword(adminPassword);
      await User.create({
        id: 'ADM-001',
        name: 'Dr. Sarah Jenkins',
        email: 'admin@edumanage.edu',
        role: 'admin',
        password_hash: adminHash
      });
      console.log('Default administrator account initialized in MongoDB Atlas.');
    }

    // Seed standard courses catalog if empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      const standardCourses = [
        { code: 'CS101', name: 'Computer Systems & Architecture', dept: 'Computer Science', credits: 4, max_capacity: 60 },
        { code: 'DS204', name: 'Machine Learning & Statistical Data', dept: 'Data Science', credits: 3, max_capacity: 50 },
        { code: 'CS302', name: 'Web Systems Engineering & Microservices', dept: 'Computer Science', credits: 4, max_capacity: 45 },
        { code: 'IT410', name: 'Cloud Infrastructure & DevOps Lab', dept: 'Computer Science', credits: 3, max_capacity: 40 },
        { code: 'BIO302', name: 'Molecular Genetics & Genomics', dept: 'Biotechnology', credits: 4, max_capacity: 50 },
        { code: 'BUS105', name: 'Financial Accounting Principles', dept: 'Business Admin', credits: 3, max_capacity: 70 }
      ];
      await Course.insertMany(standardCourses);
      console.log('Standard academic courses catalog initialized in MongoDB Atlas.');
    }
  } catch (err) {
    console.error('MongoDB Atlas Connection Error:', err);
    throw err;
  }
}

module.exports = {
  connectDB,
  User,
  Teacher,
  Student,
  Course,
  Notification,
  NotificationRead,
  Attendance,
  Assignment
};
