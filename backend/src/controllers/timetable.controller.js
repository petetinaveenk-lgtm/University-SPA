const { readData, writeData, generateId } = require('../utils/fileStorage');

/**
 * Checks if two time intervals overlap (assuming HH:mm format)
 */
function isTimeOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Get all timetable entries with optional day and department filters
 */
exports.getAllTimetable = async (req, res, next) => {
  try {
    const timetable = await readData('timetable');
    const { day, department, faculty, search } = req.query;

    let result = timetable;

    if (day && day !== 'All') {
      result = result.filter(t => t.day && t.day.toLowerCase() === day.trim().toLowerCase());
    }

    if (department && department !== 'All') {
      result = result.filter(t => t.department && t.department.toLowerCase() === department.trim().toLowerCase());
    }

    if (faculty && faculty !== 'All') {
      result = result.filter(t => t.faculty && t.faculty.toLowerCase() === faculty.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(t =>
        (t.course && t.course.toLowerCase().includes(q)) ||
        (t.faculty && t.faculty.toLowerCase().includes(q)) ||
        (t.room && t.room.toLowerCase().includes(q)) ||
        (t.department && t.department.toLowerCase().includes(q))
      );
    }

    // Sort timetable by day of week then startTime
    const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
    result.sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

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
 * Get timetable entry by ID
 */
exports.getTimetableById = async (req, res, next) => {
  try {
    const timetable = await readData('timetable');
    const entry = timetable.find(t => t.id === req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: `Timetable slot with ID '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add timetable entry with schedule conflict detection
 */
exports.createTimetable = async (req, res, next) => {
  try {
    const { day, startTime, endTime, course, faculty, room, department } = req.body;

    if (!day || !startTime || !endTime || !course || !faculty || !room || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields (day, startTime, endTime, course, faculty, room, department) are required.'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be earlier than End time.'
      });
    }

    const timetable = await readData('timetable');

    // Check conflict for Room on the same day
    const roomConflict = timetable.find(t => 
      t.day.toLowerCase() === day.trim().toLowerCase() &&
      t.room.toLowerCase() === room.trim().toLowerCase() &&
      isTimeOverlapping(startTime, endTime, t.startTime, t.endTime)
    );

    if (roomConflict) {
      return res.status(409).json({
        success: false,
        message: `Room conflict: Room "${room}" is already booked on ${day} from ${roomConflict.startTime} to ${roomConflict.endTime} for "${roomConflict.course}".`
      });
    }

    // Check conflict for Faculty on the same day
    const facultyConflict = timetable.find(t => 
      t.day.toLowerCase() === day.trim().toLowerCase() &&
      t.faculty.toLowerCase() === faculty.trim().toLowerCase() &&
      isTimeOverlapping(startTime, endTime, t.startTime, t.endTime)
    );

    if (facultyConflict) {
      return res.status(409).json({
        success: false,
        message: `Faculty conflict: ${faculty} is already assigned a class on ${day} from ${facultyConflict.startTime} to ${facultyConflict.endTime} (${facultyConflict.course} in ${facultyConflict.room}).`
      });
    }

    const newEntry = {
      id: generateId('TMT', timetable, 101),
      day: day.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      course: course.trim(),
      faculty: faculty.trim(),
      room: room.trim(),
      department: department.trim()
    };

    timetable.push(newEntry);
    await writeData('timetable', timetable);

    res.status(201).json({
      success: true,
      message: 'Timetable class scheduled successfully.',
      data: newEntry
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update timetable entry with conflict detection
 */
exports.updateTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, course, faculty, room, department } = req.body;

    const timetable = await readData('timetable');
    const index = timetable.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Timetable slot with ID '${id}' not found.`
      });
    }

    const targetDay = (day || timetable[index].day).trim();
    const targetStart = (startTime || timetable[index].startTime).trim();
    const targetEnd = (endTime || timetable[index].endTime).trim();
    const targetRoom = (room || timetable[index].room).trim();
    const targetFaculty = (faculty || timetable[index].faculty).trim();

    if (targetStart >= targetEnd) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be earlier than End time.'
      });
    }

    // Check Room conflict excluding current record
    const roomConflict = timetable.find(t =>
      t.id !== id &&
      t.day.toLowerCase() === targetDay.toLowerCase() &&
      t.room.toLowerCase() === targetRoom.toLowerCase() &&
      isTimeOverlapping(targetStart, targetEnd, t.startTime, t.endTime)
    );

    if (roomConflict) {
      return res.status(409).json({
        success: false,
        message: `Room conflict: Room "${targetRoom}" is already booked on ${targetDay} from ${roomConflict.startTime} to ${roomConflict.endTime}.`
      });
    }

    // Check Faculty conflict excluding current record
    const facultyConflict = timetable.find(t =>
      t.id !== id &&
      t.day.toLowerCase() === targetDay.toLowerCase() &&
      t.faculty.toLowerCase() === targetFaculty.toLowerCase() &&
      isTimeOverlapping(targetStart, targetEnd, t.startTime, t.endTime)
    );

    if (facultyConflict) {
      return res.status(409).json({
        success: false,
        message: `Faculty conflict: ${targetFaculty} is already scheduled on ${targetDay} from ${facultyConflict.startTime} to ${facultyConflict.endTime}.`
      });
    }

    timetable[index] = {
      ...timetable[index],
      day: targetDay,
      startTime: targetStart,
      endTime: targetEnd,
      course: course !== undefined ? course.trim() : timetable[index].course,
      faculty: targetFaculty,
      room: targetRoom,
      department: department !== undefined ? department.trim() : timetable[index].department
    };

    await writeData('timetable', timetable);

    res.json({
      success: true,
      message: 'Timetable entry updated successfully.',
      data: timetable[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete timetable entry
 */
exports.deleteTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timetable = await readData('timetable');
    const index = timetable.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Timetable slot with ID '${id}' not found.`
      });
    }

    const deleted = timetable.splice(index, 1)[0];
    await writeData('timetable', timetable);

    res.json({
      success: true,
      message: 'Timetable slot deleted successfully.',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
