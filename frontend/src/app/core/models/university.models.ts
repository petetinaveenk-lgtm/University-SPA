export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  enrollmentDate: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  facultyAssigned: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Timetable {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  course: string;
  faculty: string;
  room: string;
  department: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  status: 'Present' | 'Absent';
  remarks?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  department: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
}

export interface DepartmentBreakdown {
  department: string;
  code: string;
  studentCount: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalDepartments: number;
  totalClassesScheduled: number;
  overallAttendanceRate: number;
  recentStudents: Student[];
  departmentBreakdown: DepartmentBreakdown[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  errors?: any;
}
