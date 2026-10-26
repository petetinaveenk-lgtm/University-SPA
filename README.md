# Apex University — Single Page Application (SPA)

A full-stack University Management Single Page Application built from scratch using **Angular (TypeScript)**, **Node.js (Express.js)**, and **safe local JSON file persistence**.

Designed for Windows & Visual Studio Code with a modern academic dashboard, live statistics, dynamic filtering, form validation, conflict-aware scheduling, and attendance percentage tracking.

---

## 1. Technology Stack

- **Frontend**: Angular 22 (Standalone Components, Signals, Reactive Navigation)
- **Styling**: Vanilla CSS3 Design System (Glassmorphic cards, responsive tables, animations, Google Fonts Outfit & Plus Jakarta Sans, Remix Icons)
- **Backend**: Node.js & Express.js REST API
- **Data Storage**: Local JSON files (`backend/data/*.json`) with atomic writes and concurrency queues
- **API Client**: Angular `HttpClient` with RxJS observables
- **Development Environment**: VS Code on Windows 11/10

> **Strict Compliance**: No external databases (MySQL, MongoDB, PostgreSQL) or alternate frameworks (React, Spring Boot) are used. Data is stored directly in persistent JSON files.

---

## 2. Project Directory Structure

```text
university-spa/
├── backend/
│   ├── data/
│   │   ├── students.json        # Persistent student records
│   │   ├── faculty.json         # Faculty directory & designations
│   │   ├── courses.json         # Curriculum courses & credit units
│   │   ├── departments.json     # Academic faculties & schools
│   │   ├── timetable.json       # Class schedule & venue slots
│   │   └── attendance.json      # Daily lecture attendance logs
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js        # Port 3000, data paths, CORS
│   │   ├── controllers/
│   │   │   ├── dashboard.controller.js
│   │   │   ├── students.controller.js
│   │   │   ├── faculty.controller.js
│   │   │   ├── courses.controller.js
│   │   │   ├── departments.controller.js
│   │   │   ├── timetable.controller.js
│   │   │   └── attendance.controller.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js  # Centralized 400/404/409/500 handler
│   │   ├── routes/
│   │   │   ├── index.js         # Master API router
│   │   │   ├── dashboard.routes.js
│   │   │   ├── students.routes.js
│   │   │   ├── faculty.routes.js
│   │   │   ├── courses.routes.js
│   │   │   ├── departments.routes.js
│   │   │   ├── timetable.routes.js
│   │   │   └── attendance.routes.js
│   │   ├── utils/
│   │   │   └── fileStorage.js   # Atomic writes, mutex queues, ID generators
│   │   ├── app.js               # Express application middleware
│   │   └── server.js            # Entry point (port 3000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/
│   │   │   │   │   └── university.models.ts  # TypeScript interfaces
│   │   │   │   └── services/
│   │   │   │       ├── api.service.ts
│   │   │   │       ├── notification.service.ts
│   │   │   │       ├── dashboard.service.ts
│   │   │   │       ├── students.service.ts
│   │   │   │       ├── faculty.service.ts
│   │   │   │       ├── courses.service.ts
│   │   │   │       ├── departments.service.ts
│   │   │   │       ├── timetable.service.ts
│   │   │   │       └── attendance.service.ts
│   │   │   ├── shared/
│   │   │   │   └── components/
│   │   │   │       ├── navbar/
│   │   │   │       ├── sidebar/
│   │   │   │       ├── toast/
│   │   │   │       └── confirm-dialog/
│   │   │   ├── dashboard/       # Overview metrics & recent registrations
│   │   │   ├── students/        # Full Student Directory CRUD & Profile modal
│   │   │   ├── faculty/         # Staff directory & appointments
│   │   │   ├── courses/         # Syllabus offerings & credit weights
│   │   │   ├── departments/     # Academic units & duplicate-name guard
│   │   │   ├── timetable/       # Lecture schedule & overlap conflict prevention
│   │   │   └── attendance/      # Roll call logs & auto percentage calculation
│   │   ├── environments/
│   │   │   └── environment.ts   # Base URL: http://localhost:3000/api
│   │   ├── styles.css           # Premium Design System
│   │   ├── index.html           # Fonts and Icons
│   │   └── main.ts
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

---

## 3. Step-by-Step Instructions to Run in VS Code on Windows

### Prerequisites
1. **Node.js**: v18 or higher (v24 LTS recommended). Verify in terminal:
   ```powershell
   node -v
   npm -v
   ```
2. **Angular CLI**: Installed globally or via npx (`npm install -g @angular/cli`).

---

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Go to **File** → **Open Folder...**
3. Select this project root folder (`university-spa` or your workspace folder).

---

### Step 2: Start the Backend REST API Server (Terminal 1)
1. Open a new terminal in VS Code: **Terminal** → **New Terminal** (`Ctrl + ` `~`).
2. Navigate into the `backend` folder and install dependencies (if not already installed):
   ```powershell
   cd backend
   npm install
   ```
3. Start the Node.js Express server:
   ```powershell
   npm start
   ```
4. You will see:
   ```text
   [Database] JSON Data files verified and ready.
   ===============================================
    University Management REST API Server Running 
    Port:     http://localhost:3000
    Base API: http://localhost:3000/api
    Health:   http://localhost:3000/api/health
   ===============================================
   ```
   *Leave this terminal open and running.*

---

### Step 3: Start the Angular Frontend Application (Terminal 2)
1. Open a **second terminal window** by clicking the **`+`** icon in the VS Code terminal pane or pressing `Ctrl + Shift + ` `~`.
2. Navigate to the `frontend` directory:
   ```powershell
   cd frontend
   npm install
   ```
3. Start the Angular local dev server:
   ```powershell
   npm start
   ```
4. Once compilation finishes, open your browser and navigate to:
   👉 **`http://localhost:4200`**

---

## 4. Modules & Key Features

### A. Dashboard Overview (`/dashboard`)
- **Metric Cards**: Real-time totals for Students, Faculty, Courses, and Departments fetched dynamically from `/api/dashboard/stats`.
- **Live Sync Indicator**: Green pulse in navbar confirms backend connection status.
- **Recent Registrations**: Displays the last 5 enrolled students with dates and department badges.
- **Department Distribution**: Visual progress breakdown of enrollment numbers per school.
- **Campus Attendance Meter**: Aggregated attendance percentage calculated across all course logs.

### B. Student Management (`/students`)
- **CRUD Operations**: Add student, view all, edit student, and delete student with modal confirmation.
- **Student Profile Card**: Click the eye icon to view full profile details and registration dates.
- **Search & Filters**: Real-time search across student name, ID (`STU-1001`), and email. Filter by Department and Class Year.
- **Data Validation**: Enforces valid email formats, required contact info, and rejects duplicate email registrations with HTTP 409.

### C. Faculty Management (`/faculty`)
- **CRUD Operations**: Appoint new faculty members, update contact details, and remove records.
- **Designation Roles**: Professor, Associate Professor, Assistant Professor, Lecturer, Department Chair.
- **Search & Filter**: Filter by department and search across staff names.

### D. Course Management (`/courses`)
- **CRUD Operations**: Create, update, and delete syllabus courses.
- **Course Attributes**: Unique Course Code (e.g. `CS101`), Course Name, Credit Units (1-10), Assigned Department, and Assigned Faculty Instructor.
- **Validation**: Enforces unique Course Codes across the university catalog.

### E. Department Management (`/departments`)
- **CRUD Operations**: Establish departments, modify descriptions, and delete faculties.
- **Duplicate Prevention**: Strictly prevents duplicate department names (case-insensitive check returns HTTP 409).

### F. Timetable Management (`/timetable`)
- **Schedule Management**: Create and view weekly lecture/lab slots with Day, Start Time, End Time, Course, Faculty, Room, and Department.
- **Automated Conflict Prevention**:
  - Rejects double-booking the **same classroom/lab** on the same day during overlapping time slots.
  - Rejects scheduling the **same faculty member** for two simultaneous classes on the same day.
  - Error messages clearly inform which room or instructor is already occupied.
- **Day-by-Day Filtering**: Filter timetable by Monday through Saturday tabs and department.

### G. Attendance Management (`/attendance`)
- **Dual Mode**:
  - **Attendance Log Records**: View historical roll calls, filter by course, date, and status. Toggle individual Present/Absent status with a single click.
  - **Student Percentages & Standing**: Automatically calculates:
    $$\text{Percentage} = \left(\frac{\text{Classes Attended}}{\text{Total Classes}}\right) \times 100$$
    Renders visual progress bars with standing alerts (*Good Standing* $\ge 75\%$, *At Risk* $50\text{--}74\%$, *Critical* $< 50\%$).
- **Take Class Roll Call**: Batch attendance sheet to mark an entire class as Present/Absent in one operation.
- **Duplicate Entry Guard**: Prevents recording multiple attendance entries for the same student, course, and date (HTTP 409).

---

## 5. API Endpoint Documentation

Base URL: `http://localhost:3000/api`

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Returns aggregated metrics, recent students, and attendance rate |
| `GET` | `/health` | Server heartbeat status check |

#### Example Response: `GET /api/dashboard/stats`
```json
{
  "success": true,
  "data": {
    "totalStudents": 6,
    "totalFaculty": 5,
    "totalCourses": 5,
    "totalDepartments": 4,
    "overallAttendanceRate": 83.3,
    "recentStudents": [...],
    "departmentBreakdown": [...]
  }
}
```

---

### Students (`/students`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | Get all students (Supports `?search=`, `?department=`, `?year=`) |
| `GET` | `/students/:id` | Get student details by ID |
| `POST` | `/students` | Register a new student (validates fields and unique email) |
| `PUT` | `/students/:id` | Update student information |
| `DELETE` | `/students/:id` | Delete student record |

#### Example Request: `POST /api/students`
```json
{
  "name": "Sarah Connor",
  "email": "sarah.connor@student.university.edu",
  "phone": "+1-555-0312",
  "department": "Computer Science & Engineering",
  "year": "2nd Year",
  "enrollmentDate": "2026-09-01"
}
```

---

### Timetable (`/timetable`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/timetable` | Get timetable entries (Supports `?day=`, `?department=`) |
| `POST` | `/timetable` | Create slot with room & faculty conflict verification |
| `PUT` | `/timetable/:id` | Update slot with conflict check |
| `DELETE` | `/timetable/:id` | Remove timetable slot |

#### Schedule Conflict Response (`409 Conflict`):
```json
{
  "success": false,
  "status": 409,
  "message": "Room conflict: Room \"Room 301\" is already booked on Monday from 09:00 to 10:30."
}
```

---

### Attendance (`/attendance`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/attendance` | Get attendance logs (Supports `?course=`, `?date=`, `?status=`) |
| `GET` | `/attendance/summary` | Get computed attendance percentage per student |
| `POST` | `/attendance` | Record single entry (guards against duplicate for same student/course/date) |
| `POST` | `/attendance/bulk` | Record batch class attendance roll call |
| `PUT` | `/attendance/:id` | Update attendance status or remarks |
| `DELETE` | `/attendance/:id` | Remove attendance entry |

---

## 6. Local JSON Storage & Data Reset

All data records are stored in:
- `backend/data/students.json`
- `backend/data/faculty.json`
- `backend/data/courses.json`
- `backend/data/departments.json`
- `backend/data/timetable.json`
- `backend/data/attendance.json`

### Safe Persistence Guarantee:
- Writes are queued per file to eliminate race conditions.
- Each write is performed atomically using temporary file generation and replacement.
- Missing files or directories are recreated automatically on startup.

### How to Reset Data:
1. **To clear all tables to empty arrays `[]`**:
   Send a POST request in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reset" -Method Post -Body '{"mode":"empty"}' -ContentType "application/json"
   ```
2. **Or manually edit/revert** the files in `backend/data/` using any text editor while the server is running or stopped.

---

## 7. Troubleshooting & FAQ

### Issue: "Port 3000 is already in use"
**Solution**: Stop any process using port 3000 in PowerShell:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Issue: "Port 4200 is already in use"
**Solution**: Run Angular on an alternate port:
```powershell
npm start -- --port 4300
```
Then navigate to `http://localhost:4300`. (CORS in `backend/src/app.js` supports all local development origins).

### Issue: "Script execution is disabled on this system (PSSecurityException)"
**Solution**: Run PowerShell as Administrator and enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 8. Verification & Quality Checklist

- [x] All 7 modules implemented with real backend communication
- [x] Responsive layout with sidebar, navbar, and mobile drawer
- [x] Form validation on all fields with real-time feedback
- [x] Safe JSON atomic file storage and queue locking
- [x] Room and faculty schedule overlap conflict prevention
- [x] Duplicate email, course code, and attendance prevention
- [x] Student attendance percentage calculation formula
- [x] Zero compilation errors on `ng build`
- [x] Tested and verified via automated test suite
