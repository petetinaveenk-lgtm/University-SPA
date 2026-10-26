const { readData, writeData, generateId } = require('../utils/fileStorage');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Get all faculty members with search and department filter
 */
exports.getAllFaculty = async (req, res, next) => {
  try {
    const facultyList = await readData('faculty');
    const { search, department } = req.query;

    let result = facultyList;

    if (department && department !== 'All') {
      result = result.filter(f => f.department && f.department.toLowerCase() === department.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.id && f.id.toLowerCase().includes(q)) ||
        (f.designation && f.designation.toLowerCase().includes(q))
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
 * Get faculty by ID
 */
exports.getFacultyById = async (req, res, next) => {
  try {
    const facultyList = await readData('faculty');
    const faculty = facultyList.find(f => f.id === req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new faculty member
 */
exports.createFaculty = async (req, res, next) => {
  try {
    const { name, email, phone, department, designation } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Faculty name is required.' });
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
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: 'Designation is required.' });
    }

    const facultyList = await readData('faculty');

    // Prevent duplicate email
    const duplicateEmail = facultyList.find(
      f => f.email && f.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message: `Faculty with email "${email.trim()}" already exists.`
      });
    }

    const newFaculty = {
      id: generateId('FAC', facultyList, 101),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      department: department.trim(),
      designation: designation.trim()
    };

    facultyList.push(newFaculty);
    await writeData('faculty', facultyList);

    res.status(201).json({
      success: true,
      message: 'Faculty member added successfully.',
      data: newFaculty
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update faculty member
 */
exports.updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, designation } = req.body;

    const facultyList = await readData('faculty');
    const index = facultyList.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID '${id}' not found.`
      });
    }

    if (email) {
      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
      }
      const duplicateEmail = facultyList.find(
        f => f.id !== id && f.email && f.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Another faculty member with email "${email.trim()}" already exists.`
        });
      }
    }

    facultyList[index] = {
      ...facultyList[index],
      name: name !== undefined ? name.trim() : facultyList[index].name,
      email: email !== undefined ? email.trim().toLowerCase() : facultyList[index].email,
      phone: phone !== undefined ? phone.trim() : facultyList[index].phone,
      department: department !== undefined ? department.trim() : facultyList[index].department,
      designation: designation !== undefined ? designation.trim() : facultyList[index].designation
    };

    await writeData('faculty', facultyList);

    res.json({
      success: true,
      message: 'Faculty member updated successfully.',
      data: facultyList[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete faculty member
 */
exports.deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyList = await readData('faculty');
    const index = facultyList.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID '${id}' not found.`
      });
    }

    const deleted = facultyList.splice(index, 1)[0];
    await writeData('faculty', facultyList);

    res.json({
      success: true,
      message: `Faculty member "${deleted.name}" deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
