# 🎓 Full Stack Dynamic Online Examination System

A complete online examination platform built with Next.js (React), Node.js/Express, and MySQL with JWT authentication.

---

## � Setup & Installation

### Option 1: Docker (Recommended for LAN/Server Setup)

1. **Prerequisites:**
   - Docker and Docker Compose installed
   - At least 4GB RAM available

2. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd offline-mock-test-system
   ```

3. **Environment Configuration:**
   - Update `backend/.env` with your database credentials if needed
   - Default Docker setup uses MySQL with predefined credentials

4. **Start the System:**
   ```bash
   docker-compose up --build
   ```

5. **Access the Application:**
   - Frontend: http://localhost:3000 (or server IP:3000 on LAN)
   - Backend API: http://localhost:5000 (or server IP:5000 on LAN)
   - Database: localhost:3306 (internal to Docker network)

6. **Stop the System:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Prerequisites:**
   - Node.js 18+
   - MySQL 8.0+
   - npm or yarn

2. **Database Setup:**
   ```sql
   CREATE DATABASE mock_test_system;
   -- Run the SQL from backend/schema.sql
   -- Run the seed data from backend/seed.js
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Frontend Setup:**
   ```bash
   cd ..
   npm install
   npm run dev
   ```

5. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

---

## ✨ Features

### 🔐 Authentication System
- JWT-based secure authentication
- Role-based access control (Admin & Student)
- Encrypted password storage with bcrypt
- Protected routes for both admin and student

### 👨‍💼 Admin Features
- ✅ Create exams with dynamic types and batches
- ✅ Upload Word (.docx) files and auto-parse questions
- ✅ Manage students (add, edit, delete)
- ✅ Assign exams to student batches
- ✅ View all student results and performance
- ✅ Manage exam settings and schedules

### 🎓 Student Features
- ✅ Login and batch selection
- ✅ View assigned exams
- ✅ Attempt exams with timer
- ✅ Submit answers and get scores
- ✅ View result history
- ✅ No re-attempt on submitted exams

### 📊 Additional Features
- ✅ Auto-submit when time ends
- ✅ Countdown timer with warning
- ✅ Question navigator sidebar
- ✅ Responsive design
- ✅ Form validation on all pages

---

## 📁 Project Structure

```
offline-mock-test-system/
├── frontend/
│   ├── pages/
│   │   ├── _app.js                 # Global app wrapper with Auth Provider
│   │   ├── admin-login.js          # Admin login page
│   │   ├── admin-dashboard.js      # Admin hub with navigation
│   │   ├── admin-create-exam.js    # Create exam with file upload
│   │   ├── admin-add-student.js    # Add new students
│   │   ├── admin-students.js       # Manage students
│   │   ├── admin-settings.js       # Exam settings
│   │   ├── admin-profile.js        # Admin profile
│   │   ├── student-login.js        # Student login with batch selection
│   │   ├── student-dashboard.js    # Student dashboard with available exams
│   │   ├── exam.js                 # Exam attempt page with timer
│   │   └── index.js                # Home page
│   ├── components/
│   │   ├── AdminLayout.js          # Shared admin layout with navbar
│   │   └── AuthContext.js          # Auth context provider
│   ├── styles/
│   │   ├── Admin.module.css        # Admin pages styling
│   │   ├── Login.module.css        # Login page styling
│   │   └── globals.css             # Global styles
│   └── package.json
│
├── backend/
│   ├── db.js                       # MySQL connection
│   ├── server.js                   # Express server configuration
│   ├── schema.sql                  # Database schema
│   ├── seed.js                     # Seed data for testing
│   ├── routes/
│   │   ├── auth.js                 # Authentication endpoints & JWT
│   │   ├── students.js             # Student CRUD & batch endpoints
│   │   └── exams.js                # Exam management & submission
│   ├── uploads/                    # Word file upload directory
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v14+ and npm
- MySQL 5.7+
- Git

### Step 1: Clone/Extract Project
```bash
cd offline-mock-test-system
```

### Step 2: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Configure .env file (optional)
# Create a .env file with:
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=your_password
# DB_NAME=mock_test_system
# JWT_SECRET=your_secret_key

# Create database tables
node -e "const db = require('./db'); const fs = require('fs'); const sql = fs.readFileSync('schema.sql', 'utf8'); db.query(sql, (err) => { if(err) console.error('Error:', err); else console.log('Schema created'); db.end(); });"

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### Step 3: Setup Frontend
```bash
# In another terminal, from root directory
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3002` (or available port)

---

## 💾 Database Schema

### Users Table
```sql
id (INT, PK)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
role (ENUM: 'admin', 'student')
batch (VARCHAR, nullable)
created_at (TIMESTAMP)
```

### Exams Table
```sql
id (INT, PK)
name (VARCHAR)
type (VARCHAR) -- dynamic, e.g., NDA, NEET, JEE
batch (VARCHAR) -- which batch can attend
duration (INT) -- in minutes
scheduled_time (DATETIME)
total_questions (INT)
created_at (TIMESTAMP)
```

### Questions Table
```sql
id (INT, PK)
exam_id (INT, FK)
section_name (VARCHAR)
question_text (TEXT)
```

### Options Table
```sql
id (INT, PK)
question_id (INT, FK)
option_text (TEXT)
is_correct (BOOLEAN)
```

### Student_Exam Table
```sql
id (INT, PK)
student_id (INT, FK)
exam_id (INT, FK)
score (INT)
status (ENUM: 'not_started', 'in_progress', 'completed')
answers (JSON) -- stores {question_id: option_id}
time_taken (INT) -- in seconds
submitted_at (TIMESTAMP)
UNIQUE(student_id, exam_id) -- prevent re-attempt
```

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Response: { token, user: { id, name, email, role, batch } }
```

### Students (Admin Only)
```
GET    /api/students                 -- List all students
POST   /api/students/add             -- Add new student
PUT    /api/students/update/:id      -- Update student
DELETE /api/students/delete/:id      -- Delete student
GET    /api/students/batches         -- Get available batches
```

### Exams
```
GET    /api/exams                    -- Get exams (filtered by role)
POST   /api/exams/add                -- Create exam (admin, with file upload)
GET    /api/exams/:id/questions      -- Get exam questions (student)
POST   /api/exams/:id/submit         -- Submit exam answers (student)
GET    /api/exams/results            -- Get student results
GET    /api/exams/all-results        -- Get all results (admin)
```

---

## 📄 Frontend Pages

### Admin Pages

#### `/admin-login`
- Login form for admin authentication
- Email and password fields
- Redirects to admin-dashboard on success

#### `/admin-dashboard`
- Main hub for admin
- Sidebar navigation to all admin functions
- Welcome message with admin name

#### `/admin-create-exam`
- Form to create new exam
- Fields: Name, Type, Batch, Duration, Scheduled Time
- File upload for Word file (.docx)
- Auto-parses questions from uploaded file

#### `/admin-add-student`
- Form to register new student
- Fields: Name, Email, Password, Batch, Year, Roll No, Mobile
- Password confirmation validation
- Creates student account

#### `/admin-students`
- Table of all registered students
- Edit student details modal
- Delete student with confirmation
- Shows email and batch info

#### `/admin-settings`
- View exam settings in table
- Click to edit exam details
- Update name, time, date

#### `/admin-profile`
- View admin profile information
- Edit profile details
- Change password functionality
- Shows security info

### Student Pages

#### `/student-login`
- Email and password login
- After login: Select batch from dropdown  (only shown batches where student doesn't match existing batch)
- Two-step authentication flow

#### `/student-dashboard`
- List of available exams for student's batch
- Shows exam name, type, duration, scheduled time
- View past results with scores
- "Start Exam" button for each exam

#### `/exam`
- Full exam interface
- Question display with options (MCQ)
- Previous/Next navigation
- Question navigator sidebar with status indicators
- Countdown timer (red when <5 minutes)
- Submit button for exam submission
- Auto-submit when time ends

---

## 🧪 Testing Instructions

### Test Credentials

#### Admin Account
```
Email: admin@test.com
Password: admin123
```

#### Student Account
```
Email: student1@test.com
Password: student123
Batch: 2024
```

### Test Workflow

#### 1. Admin Creates Exam
- Go to `/admin-login`, login as admin
- Navigate to "Create Exam"
- Fill form:
  - Name: "Mathematics Test"
  - Type: "NDA"
  - Batch: "2024"
  - Duration: 30 minutes
  - Scheduled Time: Tomorrow at 10:00 AM
- Add sample Word file with questions (see format below)
- Submit

#### 2. Create Test Student
- From admin-dashboard, go to "Add Student"
- Fill form:
  - Name: "Test Student"
  - Email: "teststudent@test.com"
  - Password: "test123"
  - Batch: "2024"
  - More fields as needed
- Submit

#### 3. Student Takes Exam
- Go to `/student-login`
- Login with student credentials
- Select batch "2024"
- View available exams
- Click "Start Exam"
- Answer questions
- Submit After answering a few
- View score

### Word File Format

For exam question upload, format .docx file as:

```
Section: Mathematics

Question: What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
Correct: B

Question: What is 5 * 3?
A) 15
B) 20
C) 25
D) 30
Correct: A

Section: Science

Question: What is H2O?
A) Hydrogen
B) Water
C) Oxygen
D) Carbon
Correct: B
```

---

## 🛠️ Troubleshooting

### Issue: Database Connection Error
**Solution:**
```bash
# Check MySQL is running
# Verify credentials in backend/.env or db.js
# Ensure mock_test_system database exists
node -e "const db = require('./db'); db.query('SHOW TABLES FROM mock_test_system', (err, result) => { console.log(err ? 'Error' : 'Tables:', result); db.end(); });"
```

### Issue: Port Already in Use
**Solution:**
```bash
# Find process on port 3000/5000
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different ports by modifying server.js and next.config.js
```

### Issue: CORS Error from Frontend
**Solution:**
- Ensure backend is running on http://localhost:5000
- Backend has `cors()` middleware enabled
- Check frontend API calls use correct base URL

### Issue: Authentication Token Not Persisting
**Solution:**
- Token is stored in localStorage
- Clear localStorage: `localStorage.clear()` in browser console
- Re-login to get new token
- Check JWT_SECRET in backend/.env matches

### Issue: File Upload Not Working
**Solution:**
- Ensure `backend/uploads/` directory exists
- Check multer is configured in server.js
- Word file must be valid .docx format
- File size limit: 10MB (configurable)

---

## 📈 Next Steps

### Possible Enhancements
- [ ] PDF export of results
- [ ] Leaderboard with top performers
- [ ] Analytics dashboard for admin
- [ ] Email notifications for exams
- [ ] Question bank management
- [ ] Image support in questions
- [ ] Negative marking
- [ ] Section-wise timer
- [ ] Review mode after submission

---

## 📞 Support

For issues or questions about the system:
1. Check database connection
2. Verify all dependencies are installed
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Review API responses in Network tab

---

## 📝 License

This project is provided as-is for educational purposes.

---

**Happy Examination! 🎉**