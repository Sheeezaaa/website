// Centralized API Client for Battle of Brains 2026
// Connects frontend components to authoritative Express server

const API_BASE = '/api';

// Admin Token
export const getAdminAuthToken = () => {
  try {
    return localStorage.getItem('bob_admin_jwt_token') || '';
  } catch {
    return '';
  }
};

export const setAdminAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('bob_admin_jwt_token', token);
    } else {
      localStorage.removeItem('bob_admin_jwt_token');
    }
  } catch {}
};

// Student Participant Token
export const getStudentAuthToken = () => {
  try {
    return localStorage.getItem('bob_student_jwt_token') || '';
  } catch {
    return '';
  }
};

export const setStudentAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('bob_student_jwt_token', token);
    } else {
      localStorage.removeItem('bob_student_jwt_token');
    }
  } catch {}
};

// Active Auth Header (Picks Admin token if available, else Student token)
export const getActiveAuthHeader = () => {
  const adminToken = getAdminAuthToken();
  if (adminToken) return { Authorization: `Bearer ${adminToken}` };
  const studentToken = getStudentAuthToken();
  if (studentToken) return { Authorization: `Bearer ${studentToken}` };
  return {};
};

// ==========================================
// AUTHENTICATION
// ==========================================

export async function apiAdminLogin(username, passcode) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passcode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed.');
    setAdminAuthToken(data.token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiStudentRegister(formData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Student registration failed.');
    if (data.token) {
      setStudentAuthToken(data.token);
    }
    return { success: true, participant: data.participant, token: data.token, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiStudentLogin(identifier, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid student credentials.');
    if (data.token) {
      setStudentAuthToken(data.token);
    }
    return { success: true, user: data.user, token: data.token };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiStudentResetPassword(studentId, email, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, email, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiChangePassword(currentPasscode, newPasscode) {
  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ currentPasscode, newPasscode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Passcode update failed.');
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetMe() {
  try {
    const headers = getActiveAuthHeader();
    if (!headers.Authorization) return null;
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// COMPETITION CONFIGURATION
// ==========================================

export async function apiGetCompetition() {
  try {
    const res = await fetch(`${API_BASE}/competition`);
    if (!res.ok) throw new Error('Failed to load competition data.');
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSaveCompetition(data) {
  try {
    const res = await fetch(`${API_BASE}/competition`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// REGISTRATION & PARTICIPANT MANAGEMENT
// ==========================================

export async function apiGetParticipants() {
  try {
    const res = await fetch(`${API_BASE}/participants`);
    if (!res.ok) throw new Error('Failed to fetch participants.');
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRegisterParticipant(formData) {
  return await apiStudentRegister(formData);
}

export async function apiGetRegistrations(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/registrations?${query}`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    if (!res.ok) throw new Error('Failed to load registrations.');
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiUpdateRegistrationStatus(id, status, notes = '') {
  try {
    const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status.');
    return { success: true, participant: data.participant };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiUpdateParticipant(id, changes) {
  try {
    const res = await fetch(`${API_BASE}/participants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(changes),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed.');
    return { success: true, participant: data.participant };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiDeleteParticipant(id) {
  try {
    const res = await fetch(`${API_BASE}/participants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiDeleteAllParticipants() {
  try {
    const res = await fetch(`${API_BASE}/participants`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiSaveQuestions(questions) {
  return await apiImportQuestions(questions);
}

// ==========================================
// QUESTION BANK
// ==========================================

export async function apiGetQuestions(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const headers = {};
    const adminToken = getAdminAuthToken();
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

    const res = await fetch(`${API_BASE}/questions?${query}`, { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiCreateQuestion(questionData) {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(questionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create question.');
    return { success: true, question: data.question };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiUpdateQuestion(id, changes) {
  try {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(changes),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update question.');
    return { success: true, question: data.question };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiDeleteQuestion(id) {
  try {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiImportQuestions(questions) {
  try {
    const res = await fetch(`${API_BASE}/questions/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ questions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Bulk import failed.');
    return { success: true, count: data.count };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// ROUNDS MANAGEMENT
// ==========================================

export async function apiGetRounds() {
  try {
    const res = await fetch(`${API_BASE}/rounds`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiUpdateRound(roundNumber, changes) {
  try {
    const res = await fetch(`${API_BASE}/rounds/${roundNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(changes),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiActivateRound(roundNumber, isActive) {
  try {
    const res = await fetch(`${API_BASE}/rounds/activate/${roundNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ isActive }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// SERVER-AUTHORITATIVE QUIZ ENGINE
// ==========================================

export async function apiStartQuizAttempt(roundNumber) {
  try {
    const res = await fetch(`${API_BASE}/quiz/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStudentAuthToken()}`,
      },
      body: JSON.stringify({ roundNumber }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not start quiz attempt.');
    return { success: true, attempt: data.attempt };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiSubmitQuizAnswer(attemptId, questionId, selectedOptionIndex) {
  try {
    const res = await fetch(`${API_BASE}/quiz/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStudentAuthToken()}`,
      },
      body: JSON.stringify({ attemptId, questionId, selectedOptionIndex }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit answer.');
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiSkipQuizQuestion(attemptId, questionId) {
  try {
    const res = await fetch(`${API_BASE}/quiz/skip-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStudentAuthToken()}`,
      },
      body: JSON.stringify({ attemptId, questionId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiFinishQuizAttempt(attemptId) {
  try {
    const res = await fetch(`${API_BASE}/quiz/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStudentAuthToken()}`,
      },
      body: JSON.stringify({ attemptId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetStudentQuizStatus() {
  try {
    const res = await fetch(`${API_BASE}/quiz/my-status`, {
      headers: { Authorization: `Bearer ${getStudentAuthToken()}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// RAPID-FIRE ADJUDICATION (ROUND 3)
// ==========================================

export async function apiGetRapidFireCandidates() {
  try {
    const res = await fetch(`${API_BASE}/rapidfire/candidates`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiStartRapidFire(studentId, studentName) {
  try {
    const res = await fetch(`${API_BASE}/rapidfire/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ studentId, studentName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start rapid fire.');
    return { success: true, state: data.state };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiRapidFireAction(action, questionId) {
  try {
    const res = await fetch(`${API_BASE}/rapidfire/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ action, questionId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiFinishRapidFire() {
  try {
    const res = await fetch(`${API_BASE}/rapidfire/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetRapidFireState() {
  try {
    const res = await fetch(`${API_BASE}/rapidfire/state`);
    return await res.json();
  } catch {
    return { status: 'idle' };
  }
}

// ==========================================
// BUZZER ADJUDICATION (ROUND 4)
// ==========================================

export async function apiGetBuzzerFinalists() {
  try {
    const res = await fetch(`${API_BASE}/buzzer/finalists`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiBuzzerPress(studentId, studentName) {
  try {
    const res = await fetch(`${API_BASE}/buzzer/press`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, studentName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Buzzer press rejected.');
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiAdjudicateBuzzer(outcome, penaltyPoints = 0, notes = '') {
  try {
    const res = await fetch(`${API_BASE}/buzzer/adjudicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ outcome, penaltyPoints, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Adjudication failed.');
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiResetBuzzer() {
  try {
    const res = await fetch(`${API_BASE}/buzzer/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetBuzzerState() {
  try {
    const res = await fetch(`${API_BASE}/buzzer/state`);
    return await res.json();
  } catch {
    return { status: 'idle' };
  }
}

// ==========================================
// QUALIFICATION & TIE-BREAKERS
// ==========================================

export async function apiCalculateQualification(roundNumber) {
  try {
    const res = await fetch(`${API_BASE}/qualification/calculate/${roundNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Qualification calculation failed.');
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetQualificationStatus() {
  try {
    const res = await fetch(`${API_BASE}/qualification/status`);
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// RESULTS & LEADERBOARD
// ==========================================

export async function apiGetLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/results/leaderboard`);
    if (!res.ok) throw new Error('Failed to load leaderboard.');
    return await res.json();
  } catch {
    return { leaderboard: [], totalCompetitors: 0 };
  }
}

export async function apiPublishResults(isPublished) {
  try {
    const res = await fetch(`${API_BASE}/results/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ isPublished }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// ANNOUNCEMENTS & IN-APP NOTIFICATIONS
// ==========================================

export async function apiGetAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiCreateAnnouncement(data) {
  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiDeleteAnnouncement(id) {
  try {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications/my`, {
      headers: { Authorization: `Bearer ${getStudentAuthToken()}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiMarkNotificationsRead() {
  try {
    const res = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getStudentAuthToken()}` },
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

// ==========================================
// AUDIT LOGS
// ==========================================

export async function apiGetAuditLogs() {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ==========================================
// REAL-TIME ANTI-CHEAT & PROCTORING ALERTS
// ==========================================

export async function apiReportProctorInfraction(infractionType, details, roundNumber) {
  try {
    const res = await fetch(`${API_BASE}/proctor/report-infraction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStudentAuthToken()}`,
      },
      body: JSON.stringify({ infractionType, details, roundNumber }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetProctorAlerts() {
  try {
    const res = await fetch(`${API_BASE}/proctor/live-alerts`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiAcknowledgeProctorAlert(alertId, action) {
  try {
    const res = await fetch(`${API_BASE}/proctor/acknowledge-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ alertId, action }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// SEMESTER COHORTS & PROGRESSION
// ==========================================

export async function apiGetSemesterCohorts() {
  try {
    const res = await fetch(`${API_BASE}/participants/cohorts`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    if (!res.ok) return { cohorts: [], totalParticipants: 0 };
    return await res.json();
  } catch {
    return { cohorts: [], totalParticipants: 0 };
  }
}

export async function apiPromoteStudentSemester(studentIds, targetSemester) {
  try {
    const res = await fetch(`${API_BASE}/participants/promote-semester`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminAuthToken()}`,
      },
      body: JSON.stringify({ studentIds, targetSemester }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiGetOutboxEmails() {
  try {
    const res = await fetch(`${API_BASE}/admin/outbox-emails`, {
      headers: { Authorization: `Bearer ${getAdminAuthToken()}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
