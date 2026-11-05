-- ====================================================================
-- Battle of Brains 2026 — Master PostgreSQL / Supabase Schema
-- Strict Individual Student Computing Championship
-- COMSATS University Islamabad
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM ('Participant', 'Administrator');
CREATE TYPE registration_status_enum AS ENUM ('Pending', 'Approved', 'Rejected', 'Correction_Requested');
CREATE TYPE difficulty_level_enum AS ENUM ('Easy', 'Moderate', 'Hard', 'Expert');
CREATE TYPE attempt_status_enum AS ENUM ('in_progress', 'completed', 'timed_out', 'disqualified');
CREATE TYPE buzzer_outcome_enum AS ENUM ('correct', 'incorrect', 'pass', 'timeout', 'penalty');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) when Supabase Auth is active
    registration_ref VARCHAR(32) UNIQUE NOT NULL,
    student_id VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    university_name VARCHAR(128) NOT NULL DEFAULT 'COMSATS University Islamabad',
    campus VARCHAR(64) NOT NULL DEFAULT 'Islamabad Campus',
    region VARCHAR(64) NOT NULL DEFAULT 'Federal Capital',
    university_email VARCHAR(128) UNIQUE NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    degree_program VARCHAR(64) NOT NULL DEFAULT 'BS Computer Science',
    semester VARCHAR(32) NOT NULL DEFAULT '4th Semester',
    password_hash VARCHAR(256) NOT NULL,
    registration_status registration_status_enum DEFAULT 'Pending',
    admin_notes TEXT,
    rules_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'Participant',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, role)
);

-- 5. SUBJECTS TABLE (7 Computing Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    difficulty difficulty_level_enum NOT NULL DEFAULT 'Moderate',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TOPICS TABLE
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id VARCHAR(32) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id VARCHAR(32) NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    round_number INT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    difficulty difficulty_level_enum NOT NULL DEFAULT 'Moderate',
    explanation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_tie_breaker BOOLEAN NOT NULL DEFAULT FALSE,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_index INT NOT NULL, -- 0 for A, 1 for B, 2 for C, 3 for D
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(question_id, option_index)
);

-- 9. QUESTION VERSIONS (Audit history of question changes)
CREATE TABLE IF NOT EXISTS question_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    version INT NOT NULL,
    question_text TEXT NOT NULL,
    options_snapshot JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT,
    modified_by VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPETITION ROUNDS TABLE
CREATE TABLE IF NOT EXISTS rounds (
    round_number INT PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    stage_badge VARCHAR(128),
    time_limit_seconds INT NOT NULL, -- 30 for R1, 45 for R2, 180 for R3, 10 for R4
    questions_count INT NOT NULL DEFAULT 5,
    marking_correct NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    marking_negative NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    qualification_rule TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ROUND QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS round_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_number INT NOT NULL REFERENCES rounds(round_number) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(round_number, question_id)
);

-- 12. QUIZ ATTEMPTS TABLE (Server-authoritative session)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    round_number INT NOT NULL REFERENCES rounds(round_number) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    status attempt_status_enum NOT NULL DEFAULT 'in_progress',
    score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(profile_id, round_number)
);

-- 13. ATTEMPT QUESTIONS ALLOCATION
CREATE TABLE IF NOT EXISTS attempt_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    UNIQUE(attempt_id, question_id),
    UNIQUE(attempt_id, question_order)
);

-- 14. ANSWERS TABLE (Server Evaluated Only)
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_index INT,
    is_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 15. SCORING EVENTS TABLE (Immutable Financial-Grade Ledger)
CREATE TABLE IF NOT EXISTS scoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    points NUMERIC(5,2) NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- 'mcq_correct', 'mcq_incorrect', 'buzzer_correct', 'buzzer_penalty', 'rapid_fire'
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. BUZZER EVENTS TABLE (Adjudication Console)
CREATE TABLE IF NOT EXISTS buzzer_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    buzzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_deadline TIMESTAMPTZ NOT NULL,
    outcome buzzer_outcome_enum,
    score_delta NUMERIC(4,2) DEFAULT 0.00,
    adjudicated_by VARCHAR(128) DEFAULT 'Admin Adjudicator',
    adjudicated_at TIMESTAMPTZ
);

-- 17. COMPETITION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS competition_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(256) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    rank INT,
    is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    tie_breaker_points NUMERIC(4,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, round_number)
);

-- 21. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE buzzer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Subjects & Topics: Publicly readable for active
CREATE POLICY "Public can view active subjects" ON subjects FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view topics" ON topics FOR SELECT USING (true);

-- Announcements: Public can view published
CREATE POLICY "Public can view published announcements" ON announcements FOR SELECT USING (is_published = true);

-- Results: Public can view only published results
CREATE POLICY "Public can view published results" ON results FOR SELECT USING (is_published = true);

-- Questions & Options: Participants cannot view correct answers directly
CREATE POLICY "Admins full questions access" ON questions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON ur.profile_id = p.id WHERE p.user_id = auth.uid() AND ur.role = 'Administrator')
);

-- Profiles: Users can view and edit only their own profile
CREATE POLICY "Users access own profile" ON profiles FOR ALL USING (user_id = auth.uid());

-- Attempts: Students can view their own attempts
CREATE POLICY "Users view own attempts" ON quiz_attempts FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Answers: Students can insert their own answers
CREATE POLICY "Users submit own answers" ON answers FOR INSERT WITH CHECK (
    attempt_id IN (SELECT id FROM quiz_attempts WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- ====================================================================
-- SEED INITIAL 7 COMPUTING SUBJECTS & 4 COMPETITION ROUNDS
-- ====================================================================

INSERT INTO subjects (id, code, name, difficulty, description) VALUES
('pf', 'CS-101', 'Programming Fundamentals', 'Easy', 'Core syntax, control flow, functions, memory pointers, dynamic arrays, and recursion.'),
('oop', 'CS-201', 'Object Oriented Programming', 'Moderate', 'Encapsulation, inheritance hierarchies, runtime polymorphism, interfaces, and SOLID principles.'),
('dsa', 'CS-202', 'Data Structures & Algorithms', 'Hard', 'Trees, AVL, graphs (BFS/DFS), dynamic programming, greedy algorithms, and Big-O asymptotic analysis.'),
('dbms', 'CS-301', 'Database Systems', 'Moderate', 'Relational schema, SQL queries, normalization (1NF-BCNF), ACID transactions, and indexing.'),
('cn', 'CS-302', 'Computer Networks', 'Moderate', 'OSI/TCP-IP models, subnetting, routing protocols (OSPF/BGP), socket programming, and network security.'),
('se', 'CS-303', 'Software Engineering', 'Moderate', 'Agile/Scrum, SDLC models, architectural design patterns, software testing, QA, and CI/CD.'),
('os', 'CS-401', 'Operating Systems', 'Hard', 'CPU scheduling, threads & concurrency, semaphores, deadlock prevention, virtual memory, and paging.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rounds (round_number, title, stage_badge, time_limit_seconds, questions_count, marking_correct, marking_negative, qualification_rule, is_active) VALUES
(1, 'Screening Round (MCQs)', 'Stage 01 • University Auditorium', 30, 5, 1.00, 0.00, 'Top 80% of participating students qualify for Round 2.', TRUE),
(2, 'Core CS Concepts Round', 'Stage 02 • CS Computing Complex', 45, 5, 1.00, 0.00, 'Top 4 students qualify for Round 3 (Semi-Finals).', FALSE),
(3, 'Rapid Fire Round', 'Stage 03 • Semi-Final Showdown', 180, 20, 1.00, 0.00, 'Top 2 finalists qualify for the 1-on-1 Buzzer Grand Final.', FALSE),
(4, 'Buzzer Round (Grand Final)', 'Stage 04 • The Ultimate Championship', 10, 15, 1.00, -0.50, 'Highest total score crowns the Champion of Battle of Brains 2026.', FALSE)
ON CONFLICT (round_number) DO NOTHING;
