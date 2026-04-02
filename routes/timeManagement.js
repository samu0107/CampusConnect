// routes/timeManagement.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getStudySessions, createStudySession, updateStudySession, deleteStudySession,
  getExams, createExam, updateExam, deleteExam,
} = require('../controllers/timeManagementController');

// Assignments
router.get('/assignments', protect, getAssignments);
router.post('/assignments', protect, createAssignment);
router.put('/assignments/:id', protect, updateAssignment);
router.delete('/assignments/:id', protect, deleteAssignment);

// Study Sessions
router.get('/study-sessions', protect, getStudySessions);
router.post('/study-sessions', protect, createStudySession);
router.put('/study-sessions/:id', protect, updateStudySession);
router.delete('/study-sessions/:id', protect, deleteStudySession);

// Exams
router.get('/exams', protect, getExams);
router.post('/exams', protect, createExam);
router.put('/exams/:id', protect, updateExam);
router.delete('/exams/:id', protect, deleteExam);

module.exports = router;