<<<<<<< HEAD
# Battle of Brains 2026 — Official System Documentation
## National Individual Computing Championship
**Host:** Department of Computer Science & Information Technology, COMSATS University Islamabad  

---

## 1. Project Overview
**Battle of Brains 2026** is the official individual university computing quiz championship application. Contestants compete solo across four escalating rounds evaluating knowledge across seven foundational computing disciplines:
1. Programming Fundamentals (CS-101)
2. Object-Oriented Programming (CS-201)
3. Data Structures & Algorithms (CS-202)
4. Database Systems (CS-301)
5. Computer Networks (CS-302)
6. Software Engineering (CS-303)
7. Operating Systems (CS-401)

### Core Architectural Rules
* **Strict Individual Participation:** Every student registers, competes, scores, and qualifies solo. There are no teams, captains, or shared rosters.
* **Server-Authoritative Evaluation:** All quiz attempts, deadlines, scoring (+1, 0, -0.5), skips, and buzzer clicks are evaluated atomically on the central Express server. Answers and explanations are never transmitted to clients during active rounds.
* **Physical Round Adjudication Consoles:** Round 3 Rapid Fire (3 minutes, 3s skip rule) and Round 4 Buzzer Final (10s response window, -0.5 penalty, anti-spam buzzer controls) are managed via live administrative adjudication consoles.

---

## 2. Directory Structure
```
├── Quiz/
│   ├── data/
│   │   └── database.json          # Persistent database storage
│   ├── public/
│   │   └── images/                # Official campus imagery & branding
│   ├── src/
│   │   ├── components/            # UI components
│   │   │   ├── admin/             # Modular Admin consoles
│   │   │   │   ├── AnnouncementsManager.jsx
│   │   │   │   ├── AuditLogsViewer.jsx
│   │   │   │   ├── BuzzerConsole.jsx
│   │   │   │   ├── RapidFireConsole.jsx
│   │   │   │   ├── RegistrationManager.jsx
│   │   │   │   └── ResultsManagement.jsx
│   │   │   ├── About.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── Footer.jsx         # Official Developer Credits
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PracticeArena.jsx  # Student sandbox practice
│   │   │   ├── Registration.jsx   # Individual student registration
│   │   │   ├── Rounds.jsx
│   │   │   ├── Rules.jsx
│   │   │   ├── StudentPortal.jsx  # Contestant dashboard & live quiz arena
│   │   │   └── Subjects.jsx
│   │   ├── data/
│   │   │   ├── competitionData.js
│   │   │   ├── initialParticipants.js
│   │   │   └── sampleQuestions.js
│   │   ├── utils/
│   │   │   ├── api.js             # Centralized client for all backend endpoints
│   │   │   ├── soundEffects.js    # Web Audio API offline synth
│   │   │   └── storage.js         # Local state caching
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── supabase/
│   │   └── migrations/
│   │       └── 20261105000000_init_battle_of_brains.sql # Complete 18-table DDL schema
│   ├── tests/
│   │   └── test-runner.js         # Automated test suite (Unit, Integration, Security)
│   ├── package.json
│   ├── server.js                  # Central authoritative Express server
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 3. Environment Setup & Configuration

Create `.env` inside `Quiz/`:
```bash
# Server Port
PORT=5000

# Central JWT Secret
JWT_SECRET=bob_super_secure_jwt_secret_2026

# Developer LinkedIn URLs (Mandatory for Footer Attribution)
NEXT_PUBLIC_DEVELOPER_SHEEZA_LINKEDIN_URL=https://www.linkedin.com/in/sheeza-rasheed-94490b405
NEXT_PUBLIC_DEVELOPER_YAMEENA_LINKEDIN_URL=https://www.linkedin.com/in/yameena-murtaza
```
> If LinkedIn environment variables are unset, the footer gracefully shows a non-clickable configuration message without breaking layouts.

---

## 4. Local Installation Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Steps
1. Open PowerShell and navigate to the `Quiz` directory:
   ```powershell
   cd "Quiz"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the Authoritative Central Server:
   ```powershell
   npm run server
   ```
   *Runs at `http://localhost:5000`*
4. In a second terminal window, launch the Vite development server:
   ```powershell
   npm run dev
   ```
   *Runs at `http://localhost:3000`*

---

## 5. First Administrator Creation & Login Guide

1. Launch the application in your browser at `http://localhost:3000`.
2. Click **Admin Access** in the top navigation or the blue floating **Admin Portal** button in the lower-right corner.
3. Default administrative credentials:
   * **Username**: `admin@comsats.edu.pk`
   * **Passcode**: `admin123`
4. To change the administrative passcode:
   * Navigate to the **Security & Passcode** tab in the admin sidebar.
   * Provide the current passcode (`admin123`) and your new passcode (minimum 4 characters).
   * Click **Update Passcode**. The new hash is saved authoritatively with bcrypt.

---

## 6. PostgreSQL / Supabase Database Setup Guide

If deploying with Supabase or PostgreSQL:
1. Create a new database project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the master migration script located at:
   `Quiz/supabase/migrations/20261105000000_init_battle_of_brains.sql`
4. This script sets up:
   * 18 relational tables: `profiles`, `user_roles`, `subjects`, `topics`, `questions`, `question_options`, `question_versions`, `rounds`, `round_questions`, `quiz_attempts`, `attempt_questions`, `answers`, `scoring_events`, `buzzer_events`, `competition_settings`, `announcements`, `notifications`, `results`, `audit_logs`.
   * Row-Level Security (RLS) policies protecting answers and admin operations.
   * Default seed records for the 7 computing subjects and 4 tournament rounds.

---

## 7. Automated Testing Guide

Run the full automated test suite (Unit, Integration, Security, and Lifecycle tests):
```powershell
cd Quiz
npm test
```
The test suite validates:
* Registration validation logic & duplicate detection
* Round scoring rules & top 80% qualification mathematics
* Live server health and JWT authentication
* Student login, registration, and profile persistence
* Question bank publishing and question versioning
* Server-authoritative quiz attempt generation (verifying answer keys are not leaked)
* Server answer grading & duplicate answer rejection
* Round 3 Rapid Fire actions and Round 4 Buzzer atomic lockout
* RBAC role enforcement (preventing student access to admin endpoints)

---

## 8. Developer Attribution
* **Sheeza Rasheed**  
  Registration: **SP24-BSE-043**  
  Designation: **Developer**  
  LinkedIn: Configurable via `NEXT_PUBLIC_DEVELOPER_SHEEZA_LINKEDIN_URL`

* **Yameena Murtaza**  
  Registration: **SP24-BSE-029**  
  Designation: **Developer**  
  LinkedIn: Configurable via `NEXT_PUBLIC_DEVELOPER_YAMEENA_LINKEDIN_URL`
=======
# website
>>>>>>> 62c115f4e3a7eae033b8a6a7c8caf335a33bb9fb
