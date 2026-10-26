const { readData } = require('../utils/fileStorage');

/**
 * Get aggregated dashboard statistics dynamically computed from JSON data files
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [students, faculty, courses, departments, attendance, timetable] = await Promise.all([
      readData('students').catch(() => []),
      readData('faculty').catch(() => []),
      readData('courses').catch(() => []),
      readData('departments').catch(() => []),
      readData('attendance').catch(() => []),
      readData('timetable').catch(() => [])
    ]);

    const safeStudents = Array.isArray(students) ? students : [];
    const safeFaculty = Array.isArray(faculty) ? faculty : [];
    const safeCourses = Array.isArray(courses) ? courses : [];
    const safeDepartments = Array.isArray(departments) ? departments : [];
    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const safeTimetable = Array.isArray(timetable) ? timetable : [];

    // Recent registrations: sorted by enrollmentDate descending, take 5
    const recentStudents = [...safeStudents]
      .filter(s => s && typeof s === 'object')
      .sort((a, b) => (b.enrollmentDate || '').localeCompare(a.enrollmentDate || ''))
      .slice(0, 5);

    // Calculate overall attendance percentage
    let overallAttendanceRate = 0;
    if (safeAttendance.length > 0) {
      const validRecords = safeAttendance.filter(a => a && typeof a === 'object');
      if (validRecords.length > 0) {
        const presentCount = validRecords.filter(a => a.status === 'Present').length;
        overallAttendanceRate = Number(((presentCount / validRecords.length) * 100).toFixed(1));
      }
    }

    // Students per department
    const departmentBreakdown = safeDepartments
      .filter(d => d && d.name)
      .map(d => {
        const count = safeStudents.filter(s => 
          s && s.department && s.department.toLowerCase() === d.name.toLowerCase()
        ).length;
        return {
          department: d.name,
          code: d.code || '',
          studentCount: count
        };
      });

    const stats = {
      totalStudents: safeStudents.length,
      totalFaculty: safeFaculty.length,
      totalCourses: safeCourses.length,
      totalDepartments: safeDepartments.length,
      totalClassesScheduled: safeTimetable.length,
      overallAttendanceRate,
      recentStudents,
      departmentBreakdown
    };

    res.status(200).json({
      success: true,
      status: 'ok',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};
