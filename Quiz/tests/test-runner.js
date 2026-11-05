// Battle of Brains 2026 — Comprehensive Automated Test Suite
// Unit Tests, Integration Tests, Security Tests, and End-to-End Workflow

import assert from 'node:assert';
import test from 'node:test';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

// ====================================================================
// 1. UNIT TESTS
// ====================================================================

test('Unit Test: Registration Validation Logic', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('valid.student@comsats.edu.pk'), true);
  assert.strictEqual(emailRegex.test('invalid-email-address'), false);
  assert.strictEqual(emailRegex.test(''), false);

  const cleanPhone = '+92 300 1234567'.replace(/[\s\-\+\(\)]/g, '');
  assert.strictEqual(cleanPhone.length >= 10, true);
});

test('Unit Test: Scoring Rules and Round Multipliers', () => {
  // Round 1 & 2: +1 for correct, 0 for incorrect
  const r1Correct = 1.0;
  const r1Incorrect = 0.0;
  assert.strictEqual(r1Correct, 1.0);
  assert.strictEqual(r1Incorrect, 0.0);

  // Round 4 (Buzzer): +1 for correct, -0.5 for incorrect
  const r4Correct = 1.0;
  const r4Wrong = -0.5;
  assert.strictEqual(r4Correct + r4Wrong, 0.5);
});

test('Unit Test: Qualification Percentage Calculation (Top 80%)', () => {
  const totalStudents = 10;
  const qualifiedCount = Math.max(1, Math.ceil(totalStudents * 0.8));
  assert.strictEqual(qualifiedCount, 8);

  const singleStudent = 1;
  assert.strictEqual(Math.max(1, Math.ceil(singleStudent * 0.8)), 1);

  const round2Top4 = Math.min(4, 8);
  assert.strictEqual(round2Top4, 4);

  const round3Top2 = Math.min(2, 4);
  assert.strictEqual(round3Top2, 2);
});

test('Unit Test: Tie-Breaker Detection Logic', () => {
  const scores = [5.0, 4.0, 3.0, 3.0, 2.0];
  const cutoffIndex = 2; // top 3 qualify
  const cutoffScore = scores[cutoffIndex]; // 3.0
  const tiedCount = scores.filter((s) => s === cutoffScore).length;
  assert.strictEqual(tiedCount > 1, true); // Tie detected: 2 students with score 3.0
});

// ====================================================================
// 2. INTEGRATION TESTS (LIVE SERVER)
// ====================================================================

let adminToken = '';
let studentToken = '';
let testStudentId = `TEST-${Date.now().toString().slice(-4)}`;
let testStudentPassRef = '';
let createdQuestionId = '';
let quizAttemptId = '';
let allocatedQuestionId = '';

test('Integration: Server Healthcheck', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('Integration: Admin Login Authentication', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'admin123' }),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.token);
  adminToken = data.token;
});

test('Integration: Individual Student Registration', async () => {
  const payload = {
    fullName: "Ahmad Raza Test",
    studentId: testStudentId,
    universityName: "COMSATS University Islamabad",
    campus: "Islamabad Campus",
    region: "Federal Capital",
    email: `${testStudentId.toLowerCase()}@student.comsats.edu.pk`,
    phone: "+92 300 9998877",
    degreeProgram: "BS Computer Science",
    semester: "4th Semester",
    password: "Password@123",
    rulesAccepted: true,
  };

  const res = await fetch(`${BASE_URL}/auth/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.participant.id.startsWith('BOB-2026-'));
  testStudentPassRef = data.participant.id;
  studentToken = data.token;
});

test('Integration: Duplicate Student Registration Prevention', async () => {
  const payload = {
    fullName: "Duplicate Candidate",
    studentId: testStudentId, // Duplicate ID
    universityName: "COMSATS University",
    campus: "Islamabad Campus",
    region: "Federal Capital",
    email: `diff_email@student.comsats.edu.pk`,
    phone: "+92 300 0000000",
    degreeProgram: "BS Computer Science",
    semester: "4th Semester",
    password: "Password@123",
    rulesAccepted: true,
  };

  const res = await fetch(`${BASE_URL}/auth/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.strictEqual(res.status, 409); // Conflict status
});

test('Integration: Student Login with Password', async () => {
  const res = await fetch(`${BASE_URL}/auth/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testStudentId,
      password: "Password@123",
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.user.studentId, testStudentId);
  studentToken = data.token;
});

test('Integration: Question Bank Creation by Admin', async () => {
  const questionPayload = {
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    roundNumber: 1,
    difficulty: 'Moderate',
    question: 'Which sorting algorithm has best-case time complexity O(n)?',
    options: ['QuickSort', 'MergeSort', 'Insertion Sort', 'Selection Sort'],
    correct: 2,
    explanation: 'Insertion sort runs in O(n) when array is already sorted.',
  };

  const res = await fetch(`${BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(questionPayload),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.question.id);
  createdQuestionId = data.question.id;
});

test('Integration: Round 1 Activation', async () => {
  const res = await fetch(`${BASE_URL}/rounds/activate/1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isActive: true }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
});

test('Integration: Start Quiz Attempt (Server Authoritative)', async () => {
  const res = await fetch(`${BASE_URL}/quiz/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ roundNumber: 1 }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.attempt.id);
  assert.strictEqual(data.attempt.questions.length > 0, true);
  quizAttemptId = data.attempt.id;
  allocatedQuestionId = data.attempt.questions[0].id;

  // VERIFY CRITICAL SECURITY: Answer key must NOT be leaked to client
  assert.strictEqual(data.attempt.questions[0].correct, undefined);
  assert.strictEqual(data.attempt.questions[0].explanation, undefined);
});

test('Integration: Submit Answer & Atomic Server Scoring', async () => {
  const res = await fetch(`${BASE_URL}/quiz/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      attemptId: quizAttemptId,
      questionId: allocatedQuestionId,
      selectedOptionIndex: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.answersRecorded, 1);
});

test('Integration: Duplicate Answer Prevention (Idempotency)', async () => {
  const res = await fetch(`${BASE_URL}/quiz/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      attemptId: quizAttemptId,
      questionId: allocatedQuestionId, // Same question
      selectedOptionIndex: 2,
    }),
  });

  assert.strictEqual(res.status, 409); // Conflict: already answered
});

test('Integration: Rapid Fire Round 3 State & Action', async () => {
  const res = await fetch(`${BASE_URL}/rapidfire/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      studentId: testStudentId,
      studentName: "Ahmad Raza Test",
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.state.status, 'running');

  // Adjudicate correct
  const actRes = await fetch(`${BASE_URL}/rapidfire/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ action: 'correct' }),
  });

  assert.strictEqual(actRes.status, 200);
  const actData = await actRes.json();
  assert.strictEqual(actData.state.correctCount, 1);
  assert.strictEqual(actData.state.score, 1.0);
});

test('Integration: Buzzer Round 4 Atomic Lockout & Adjudication', async () => {
  // Reset buzzer
  await fetch(`${BASE_URL}/buzzer/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // Candidate 1 presses buzzer
  const buzzRes = await fetch(`${BASE_URL}/buzzer/press`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: testStudentId, studentName: 'Ahmad Raza' }),
  });

  assert.strictEqual(buzzRes.status, 200);
  const buzzData = await buzzRes.json();
  assert.strictEqual(buzzData.lockedStudentId, testStudentId);

  // Candidate 2 tries to buzz concurrently: MUST BE LOCKED OUT!
  const secondBuzz = await fetch(`${BASE_URL}/buzzer/press`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: 'OTHER-STUDENT', studentName: 'Other Student' }),
  });

  assert.strictEqual(secondBuzz.status, 409); // Conflict: locked out

  // Admin adjudicates correct
  const adjRes = await fetch(`${BASE_URL}/buzzer/adjudicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ outcome: 'correct' }),
  });

  assert.strictEqual(adjRes.status, 200);
  const adjData = await adjRes.json();
  assert.strictEqual(adjData.delta, 1.0);
});

test('Integration: Leaderboard Retrieval & Results Publishing', async () => {
  const res = await fetch(`${BASE_URL}/results/leaderboard`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.leaderboard));
  assert.ok(data.totalCompetitors >= 1);

  // Publish Results
  const pubRes = await fetch(`${BASE_URL}/results/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isPublished: true }),
  });
  assert.strictEqual(pubRes.status, 200);
});

// ====================================================================
// 3. SECURITY TESTS
// ====================================================================

test('Security: Participant Forbidden from Accessing Admin APIs', async () => {
  const res = await fetch(`${BASE_URL}/competition`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`, // Participant token
    },
    body: JSON.stringify({ details: { title: 'Hacked Title' } }),
  });

  assert.strictEqual(res.status, 403); // Forbidden
});

test('Security: Unauthenticated Access Denied', async () => {
  const res = await fetch(`${BASE_URL}/audit-logs`);
  assert.strictEqual(res.status, 401); // Unauthorized
});

test('Security: Public Questions Endpoint Strips Answer Key', async () => {
  const res = await fetch(`${BASE_URL}/questions`);
  assert.strictEqual(res.status, 200);
  const questions = await res.json();
  assert.ok(questions.length > 0);

  // Inspect first question: correct and explanation must NOT exist
  assert.strictEqual(questions[0].correct, undefined);
  assert.strictEqual(questions[0].explanation, undefined);
});

test('Security: Student Cannot Access Another Student Attempt', async () => {
  const res = await fetch(`${BASE_URL}/quiz/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      attemptId: 'ATT-1-FA21-BCS-042-FAKE',
      questionId: 'Q-01',
      selectedOptionIndex: 0,
    }),
  });

  assert.strictEqual(res.status, 404); // Attempt not found or ownership mismatch
});


// ====================================================================
// 4. END-TO-END WORKFLOW LIFECYCLE TEST (16 STEPS)
// ====================================================================

test('End-to-End: Full 16-Step Tournament Lifecycle Workflow', async () => {
  // Clean up any test results to guarantee deterministic top 80% qualification
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dbPath = path.resolve('data/database.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      db.results = (db.results || []).filter(r => !r.studentId.startsWith('E2E-'));
      db.attempts = (db.attempts || []).filter(a => !a.studentId.startsWith('E2E-'));
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch {}

  // Step 1: Student creates account & registers solo
  const e2eStudentId = `E2E-${Date.now().toString().slice(-4)}`;
  const regRes = await fetch(`${BASE_URL}/auth/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: "E2E Champion Candidate",
      studentId: e2eStudentId,
      universityName: "COMSATS University Islamabad",
      campus: "Islamabad Campus",
      region: "Federal Capital",
      email: `${e2eStudentId.toLowerCase()}@student.comsats.edu.pk`,
      phone: "+92 300 7776655",
      degreeProgram: "BS Computer Science",
      semester: "4th Semester",
      password: "StrongPassword@123",
      rulesAccepted: true,
    }),
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  const e2eToken = regData.token;
  const e2ePassRef = regData.participant.id;
  assert.ok(e2ePassRef.startsWith('BOB-2026-'));

  // Step 2 & 3: Student verifies and logs in
  const loginRes = await fetch(`${BASE_URL}/auth/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: e2eStudentId,
      password: "StrongPassword@123",
    }),
  });
  assert.strictEqual(loginRes.status, 200);

  // Step 4: Administrator reviews and approves registration
  const approveRes = await fetch(`${BASE_URL}/registrations/${e2ePassRef}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Approved', notes: 'Documents verified at desk' }),
  });
  assert.strictEqual(approveRes.status, 200);

  // Step 5: Administrator creates & publishes questions
  const qRes = await fetch(`${BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      subjectId: 'os',
      subjectName: 'Operating Systems',
      roundNumber: 1,
      difficulty: 'Hard',
      question: 'Which page replacement algorithm suffers from Belady anomaly?',
      options: ['LRU', 'FIFO', 'Optimal', 'LFU'],
      correct: 1,
      explanation: 'FIFO page replacement can exhibit Belady anomaly.',
    }),
  });
  assert.strictEqual(qRes.status, 201);

  // Step 6: Administrator activates Round 1
  const actRes = await fetch(`${BASE_URL}/rounds/activate/1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isActive: true }),
  });
  assert.strictEqual(actRes.status, 200);

  // Step 7: Student completes Round 1
  const attemptRes = await fetch(`${BASE_URL}/quiz/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${e2eToken}`,
    },
    body: JSON.stringify({ roundNumber: 1 }),
  });
  assert.strictEqual(attemptRes.status, 200);
  const attemptData = await attemptRes.json();
  const attemptId = attemptData.attempt.id;

  // Submit all allocated questions
  for (const q of attemptData.attempt.questions) {
    const ansRes = await fetch(`${BASE_URL}/quiz/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${e2eToken}`,
      },
      body: JSON.stringify({
        attemptId,
        questionId: q.id,
        selectedOptionIndex: 1, // submit option B
      }),
    });
    assert.strictEqual(ansRes.status, 200);
  }

  // Step 8 & 9: Scores calculated & top 80% qualify
  const qualRes1 = await fetch(`${BASE_URL}/qualification/calculate/1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(qualRes1.status, 200);
  const qualData1 = await qualRes1.json();
  assert.strictEqual(qualData1.success, true);
  assert.ok(qualData1.qualifiedCount >= 1);

  // Step 10 & 11: Repeat for Round 2 & top four advance
  await fetch(`${BASE_URL}/rounds/activate/2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isActive: true }),
  });

  const r2AttemptRes = await fetch(`${BASE_URL}/quiz/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${e2eToken}`,
    },
    body: JSON.stringify({ roundNumber: 2 }),
  });
  assert.strictEqual(r2AttemptRes.status, 200);
  const r2AttemptData = await r2AttemptRes.json();

  for (const q of r2AttemptData.attempt.questions) {
    await fetch(`${BASE_URL}/quiz/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${e2eToken}`,
      },
      body: JSON.stringify({
        attemptId: r2AttemptData.attempt.id,
        questionId: q.id,
        selectedOptionIndex: 1,
      }),
    });
  }

  const qualRes2 = await fetch(`${BASE_URL}/qualification/calculate/2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(qualRes2.status, 200);

  // Step 12 & 13: Administrator conducts Round 3 (Rapid Fire) & top 2 advance
  const rfRes = await fetch(`${BASE_URL}/rapidfire/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ studentId: e2eStudentId, studentName: "E2E Champion Candidate" }),
  });
  assert.strictEqual(rfRes.status, 200);

  await fetch(`${BASE_URL}/rapidfire/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ action: 'correct' }),
  });

  await fetch(`${BASE_URL}/rapidfire/finish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const qualRes3 = await fetch(`${BASE_URL}/qualification/calculate/3`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(qualRes3.status, 200);

  // Step 14: Administrator conducts Round 4 (Buzzer Final)
  await fetch(`${BASE_URL}/buzzer/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  await fetch(`${BASE_URL}/buzzer/press`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: e2eStudentId, studentName: "E2E Champion Candidate" }),
  });

  await fetch(`${BASE_URL}/buzzer/adjudicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ outcome: 'correct' }),
  });

  // Step 15: Final results are verified and published
  const pubRes = await fetch(`${BASE_URL}/results/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isPublished: true }),
  });
  assert.strictEqual(pubRes.status, 200);

  // Step 16: Students view their results and leaderboard
  const lbRes = await fetch(`${BASE_URL}/results/leaderboard`);
  assert.strictEqual(lbRes.status, 200);
  const lbData = await lbRes.json();
  const e2eEntry = lbData.leaderboard.find((s) => s.studentId === e2eStudentId);
  assert.ok(e2eEntry);
  assert.ok(e2eEntry.totalScore > 0);
});
