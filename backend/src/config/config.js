const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, '../../data');

const FILES = {
  students: path.join(DATA_DIR, 'students.json'),
  faculty: path.join(DATA_DIR, 'faculty.json'),
  courses: path.join(DATA_DIR, 'courses.json'),
  departments: path.join(DATA_DIR, 'departments.json'),
  timetable: path.join(DATA_DIR, 'timetable.json'),
  attendance: path.join(DATA_DIR, 'attendance.json')
};

module.exports = {
  PORT,
  DATA_DIR,
  FILES
};
