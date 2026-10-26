const { readData, writeData, generateId } = require('../utils/fileStorage');

/**
 * Get all courses with search and department filtering
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await readData('courses');
    const { search, department } = req.query;

    let result = courses;

    if (department && department !== 'All') {
      result = result.filter(c => c.department && c.department.toLowerCase() === department.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(c =>
        (c.courseName && c.courseName.toLowerCase().includes(q)) ||
        (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
        (c.facultyAssigned && c.facultyAssigned.toLowerCase().includes(q))
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
 * Get course by ID
 */
exports.getCourseById = async (req, res, next) => {
  try {
    const courses = await readData('courses');
    const course = courses.find(c => c.id === req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new course
 */
exports.createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, credits, facultyAssigned } = req.body;

    if (!courseCode || !courseCode.trim()) {
      return res.status(400).json({ success: false, message: 'Course code is required.' });
    }
    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ success: false, message: 'Course name is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }
    if (credits === undefined || credits === null || isNaN(Number(credits)) || Number(credits) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive course credits required.' });
    }

    const courses = await readData('courses');

    // Prevent duplicate courseCode
    const cleanCode = courseCode.trim().toUpperCase();
    const duplicate = courses.find(c => c.courseCode.toUpperCase() === cleanCode);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Course with code "${cleanCode}" already exists.`
      });
    }

    const newCourse = {
      id: generateId('CRS', courses, 101),
      courseCode: cleanCode,
      courseName: courseName.trim(),
      department: department.trim(),
      credits: Number(credits),
      facultyAssigned: facultyAssigned ? facultyAssigned.trim() : 'Unassigned'
    };

    courses.push(newCourse);
    await writeData('courses', courses);

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: newCourse
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update course
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, department, credits, facultyAssigned } = req.body;

    const courses = await readData('courses');
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Course with ID '${id}' not found.`
      });
    }

    if (courseCode) {
      const cleanCode = courseCode.trim().toUpperCase();
      const duplicate = courses.find(
        c => c.id !== id && c.courseCode.toUpperCase() === cleanCode
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another course with code "${cleanCode}" already exists.`
        });
      }
    }

    courses[index] = {
      ...courses[index],
      courseCode: courseCode !== undefined ? courseCode.trim().toUpperCase() : courses[index].courseCode,
      courseName: courseName !== undefined ? courseName.trim() : courses[index].courseName,
      department: department !== undefined ? department.trim() : courses[index].department,
      credits: credits !== undefined ? Number(credits) : courses[index].credits,
      facultyAssigned: facultyAssigned !== undefined ? facultyAssigned.trim() : courses[index].facultyAssigned
    };

    await writeData('courses', courses);

    res.json({
      success: true,
      message: 'Course updated successfully.',
      data: courses[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete course
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const courses = await readData('courses');
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Course with ID '${id}' not found.`
      });
    }

    const deleted = courses.splice(index, 1)[0];
    await writeData('courses', courses);

    res.json({
      success: true,
      message: `Course "${deleted.courseName}" deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
