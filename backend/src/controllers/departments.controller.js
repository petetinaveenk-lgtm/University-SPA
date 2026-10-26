const { readData, writeData, generateId } = require('../utils/fileStorage');

/**
 * Get all departments with optional query search
 */
exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await readData('departments');
    const { search } = req.query;

    let result = departments;
    if (search) {
      const q = search.trim().toLowerCase();
      result = result.filter(d => 
        (d.name && d.name.toLowerCase().includes(q)) || 
        (d.code && d.code.toLowerCase().includes(q))
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
 * Get department by ID
 */
exports.getDepartmentById = async (req, res, next) => {
  try {
    const departments = await readData('departments');
    const dept = departments.find(d => d.id === req.params.id);

    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Department with ID '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      data: dept
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new department
 */
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.'
      });
    }

    const departments = await readData('departments');

    // Prevent duplicate department names (case-insensitive)
    const normalizedName = name.trim().toLowerCase();
    const duplicate = departments.find(d => d.name.trim().toLowerCase() === normalizedName);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `A department with the name "${name.trim()}" already exists.`
      });
    }

    const newDepartment = {
      id: generateId('DEP', departments, 101),
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : '',
      description: description ? description.trim() : ''
    };

    departments.push(newDepartment);
    await writeData('departments', departments);

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: newDepartment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update department
 */
exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const departments = await readData('departments');
    const index = departments.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Department with ID '${id}' not found.`
      });
    }

    if (name) {
      const normalizedName = name.trim().toLowerCase();
      const duplicate = departments.find(
        d => d.id !== id && d.name.trim().toLowerCase() === normalizedName
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another department with the name "${name.trim()}" already exists.`
        });
      }
    }

    departments[index] = {
      ...departments[index],
      name: name !== undefined ? name.trim() : departments[index].name,
      code: code !== undefined ? code.trim().toUpperCase() : departments[index].code,
      description: description !== undefined ? description.trim() : departments[index].description
    };

    await writeData('departments', departments);

    res.json({
      success: true,
      message: 'Department updated successfully.',
      data: departments[index]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete department
 */
exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const departments = await readData('departments');
    const index = departments.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Department with ID '${id}' not found.`
      });
    }

    const deleted = departments.splice(index, 1)[0];
    await writeData('departments', departments);

    res.json({
      success: true,
      message: `Department "${deleted.name}" deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
