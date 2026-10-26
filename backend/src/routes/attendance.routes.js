const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/', attendanceController.getAllAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);
router.post('/', attendanceController.createAttendance);
router.post('/bulk', attendanceController.createBulkAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
