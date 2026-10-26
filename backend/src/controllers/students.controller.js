const { readData, writeData, generateId } = require('../utils/fileStorage');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Get all students with search and department filtering
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await readData('students');
    const { search, department, year } = req.query;

    let result = students;

    if (department && department !== 'All') {
      result = result.filter(s => s.department && s.department.toLowerCase() === department.trim().toLowerCase());
    }

    if (year && year !== 'All') {
      result = result.filter(s => s.year && s.year.toLowerCase() === year.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }

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
 * Get student by ID
 */
exports.getStudentById = async (req, res, next) => {
  try {
    const students = await readData('students');
    const student = students.find(s => s.id === req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new student
 */
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, phone, department, year, enrollmentDate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }
    if (!year || !year.trim()) {
      return res.status(400).json({ success: false, message: 'Year/Class level is required.' });
    }
    if (!enrollmentDate || !enrollmentDate.trim()) {
      return res.status(400).json({ success: false, message: 'Enrollment date is required.' });
    }

    const students = await readData('students');

    // Prevent duplicate email
    const duplicate = students.find(
      s => s.email && s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Student with email "${email.trim()}" is already registered.`
      });
    }

    const newStudent = {
      id: generateId('STU', students, 1001),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      department: department.trim(),
      year: year.trim(),
      enrollmentDate: enrollmentDate.trim()
    };

    students.push(newStudent);
    await writeData('students', students);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: newStudent
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update student
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, year, enrollmentDate } = req.body;

    const students = await readData('students');
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Student with ID '${id}' not found.`
      });
    }

    if (email) {
      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email address format.' });
      }
      const duplicate = students.find(
        s => s.id !== id && s.email && s.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another student with email "${email.trim()}" already exists.`
        });
      }
    }

    students[index] = {
      ...students[index],
      name: name !== undefined ? name.trim() : students[index].name,
      email: email !== undefined ? email.trim().toLowerCase() : students[index].email,
      phone: phone !== undefined ? phone.trim() : students[index].phone,
      department: department !== undefined ? department.trim() : students[index].department,
      year: year !== undefined ? year.trim() : students[index].year,
      enrollmentDate: enrollmentDate !== undefined ? enrollmentDate.trim() : students[index].enrollmentDate
    };

    await writeData('students', students);

    res.json({
      success: true,
      message: 'Student updated successfully.',
      data: students[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete student
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const students = await readData('students');
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Student with ID '${id}' not found.`
      });
    }

    const deleted = students.splice(index, 1)[0];
    await writeData('students', students);

    res.json({
      success: true,
      message: `Student "${deleted.name}" deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
