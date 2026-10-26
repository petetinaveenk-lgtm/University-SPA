const express = require('express');
const router = express.Router();

const studentsRoutes = require('./students.routes');
const facultyRoutes = require('./faculty.routes');
const coursesRoutes = require('./courses.routes');
const departmentsRoutes = require('./departments.routes');
const timetableRoutes = require('./timetable.routes');
const attendanceRoutes = require('./attendance.routes');
const dashboardRoutes = require('./dashboard.routes');
const { writeData } = require('../utils/fileStorage');

// Mount module routes
router.use('/students', studentsRoutes);
router.use('/faculty', facultyRoutes);
router.use('/courses', coursesRoutes);
router.use('/departments', departmentsRoutes);
router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

// System health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'University API is running',
    success: true,
    timestamp: new Date().toISOString(),
    service: 'University Management API'
  });
});

// Reset endpoint to clear or reset data
router.post('/reset', async (req, res, next) => {
  try {
    const { mode } = req.body;
    if (mode === 'empty') {
      await Promise.all([
        writeData('students', []),
        writeData('faculty', []),
        writeData('courses', []),
        writeData('departments', []),
        writeData('timetable', []),
        writeData('attendance', [])
      ]);
      return res.status(200).json({ success: true, message: 'All JSON database tables reset to empty.' });
    }

    res.status(200).json({
      success: true,
      message: 'Reset endpoint ready. Send { "mode": "empty" } to clear all data.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
