const { readData, writeData, generateId } = require('../utils/fileStorage');

/**
 * Get all attendance records with query filtering
 */
exports.getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await readData('attendance');
    const { studentId, course, date, status } = req.query;

    let result = attendance;

    if (studentId) {
      result = result.filter(a => a.studentId && a.studentId.toLowerCase() === studentId.trim().toLowerCase());
    }

    if (course && course !== 'All') {
      result = result.filter(a => a.course && a.course.toLowerCase() === course.trim().toLowerCase());
    }

    if (date) {
      result = result.filter(a => a.date === date.trim());
    }

    if (status && status !== 'All') {
      result = result.filter(a => a.status && a.status.toLowerCase() === status.trim().toLowerCase());
    }

    // Sort by date descending
    result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get attendance percentage summary for all students (or filtered by course)
 */
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const [attendanceList, studentsList] = await Promise.all([
      readData('attendance'),
      readData('students')
    ]);

    const { course } = req.query;

    const filteredAttendance = course && course !== 'All'
      ? attendanceList.filter(a => a.course && a.course.toLowerCase() === course.trim().toLowerCase())
      : attendanceList;

    // Build per-student statistics
    const statsMap = {};

    // Initialize all students
    for (const student of studentsList) {
      statsMap[student.id] = {
        studentId: student.id,
        studentName: student.name,
        department: student.department,
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        percentage: 0
      };
    }

    // Aggregate records
    for (const record of filteredAttendance) {
      if (!statsMap[record.studentId]) {
        statsMap[record.studentId] = {
          studentId: record.studentId,
          studentName: record.studentName || 'Unknown Student',
          department: '',
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          percentage: 0
        };
      }

      statsMap[record.studentId].totalClasses += 1;
      if (record.status === 'Present') {
        statsMap[record.studentId].presentCount += 1;
      } else {
        statsMap[record.studentId].absentCount += 1;
      }
    }

    const summary = Object.values(statsMap).map(item => {
      const pct = item.totalClasses > 0 ? (item.presentCount / item.totalClasses) * 100 : 0;
      return {
        ...item,
        percentage: Number(pct.toFixed(1))
      };
    });

    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Record single student attendance
 */
exports.createAttendance = async (req, res, next) => {
  try {
    const { studentId, studentName, course, date, status, remarks } = req.body;

    if (!studentId || !studentName || !course || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: studentId, studentName, course, date, status.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Present" or "Absent".'
      });
    }

    const attendanceList = await readData('attendance');

    // Prevent duplicate attendance entries for the same student, course, and date
    const duplicate = attendanceList.find(a => 
      a.studentId.toLowerCase() === studentId.trim().toLowerCase() &&
      a.course.toLowerCase() === course.trim().toLowerCase() &&
      a.date === date.trim()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Attendance for ${studentName} (${studentId}) in "${course}" on ${date} has already been recorded.`
      });
    }

    const newRecord = {
      id: generateId('ATT', attendanceList, 101),
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      course: course.trim(),
      date: date.trim(),
      status,
      remarks: remarks ? remarks.trim() : ''
    };

    attendanceList.push(newRecord);
    await writeData('attendance', attendanceList);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: newRecord
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk record attendance for a class
 */
exports.createBulkAttendance = async (req, res, next) => {
  try {
    const { course, date, records } = req.body;

    if (!course || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid course, date, and non-empty records array required.'
      });
    }

    const attendanceList = await readData('attendance');
    const addedRecords = [];
    const skippedRecords = [];

    for (const item of records) {
      const exists = attendanceList.some(a =>
        a.studentId.toLowerCase() === item.studentId.trim().toLowerCase() &&
        a.course.toLowerCase() === course.trim().toLowerCase() &&
        a.date === date.trim()
      );

      if (exists) {
        skippedRecords.push(item.studentName || item.studentId);
      } else {
        const newRecord = {
          id: generateId('ATT', [...attendanceList, ...addedRecords], 101),
          studentId: item.studentId.trim(),
          studentName: item.studentName.trim(),
          course: course.trim(),
          date: date.trim(),
          status: item.status === 'Absent' ? 'Absent' : 'Present',
          remarks: item.remarks ? item.remarks.trim() : ''
        };
        addedRecords.push(newRecord);
      }
    }

    if (addedRecords.length > 0) {
      attendanceList.push(...addedRecords);
      await writeData('attendance', attendanceList);
    }

    res.status(201).json({
      success: true,
      message: `Recorded ${addedRecords.length} attendance entries.${skippedRecords.length > 0 ? ` Skipped ${skippedRecords.length} duplicates.` : ''}`,
      addedCount: addedRecords.length,
      skippedCount: skippedRecords.length,
      data: addedRecords
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update attendance entry
 */
exports.updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendanceList = await readData('attendance');
    const index = attendanceList.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Attendance record with ID '${id}' not found.`
      });
    }

    if (status && !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Present" or "Absent".'
      });
    }

    attendanceList[index] = {
      ...attendanceList[index],
      status: status || attendanceList[index].status,
      remarks: remarks !== undefined ? remarks.trim() : attendanceList[index].remarks
    };

    await writeData('attendance', attendanceList);

    res.json({
      success: true,
      message: 'Attendance updated successfully.',
      data: attendanceList[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete attendance record
 */
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendanceList = await readData('attendance');
    const index = attendanceList.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Attendance record with ID '${id}' not found.`
      });
    }

    const deleted = attendanceList.splice(index, 1)[0];
    await writeData('attendance', attendanceList);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully.',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
