import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — Apex University'
  },
  {
    path: 'students',
    loadComponent: () => import('./students/students.component').then(m => m.StudentsComponent),
    title: 'Students — Apex University'
  },
  {
    path: 'faculty',
    loadComponent: () => import('./faculty/faculty.component').then(m => m.FacultyComponent),
    title: 'Faculty — Apex University'
  },
  {
    path: 'courses',
    loadComponent: () => import('./courses/courses.component').then(m => m.CoursesComponent),
    title: 'Courses — Apex University'
  },
  {
    path: 'departments',
    loadComponent: () => import('./departments/departments.component').then(m => m.DepartmentsComponent),
    title: 'Departments — Apex University'
  },
  {
    path: 'timetable',
    loadComponent: () => import('./timetable/timetable.component').then(m => m.TimetableComponent),
    title: 'Timetable — Apex University'
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent),
    title: 'Attendance — Apex University'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
