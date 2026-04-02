// controllers/timeManagementController.js
const { Assignment, StudySession, Exam } = require('../models/TimeManagement');

// ── ASSIGNMENTS ──
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, description, deadline, priority } = req.body;
    const assignment = await Assignment.create({
      userId: req.user._id, title, subject, description, deadline, priority
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STUDY SESSIONS ──
exports.getStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).sort({ date: 1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStudySession = async (req, res) => {
  try {
    const { subject, topic, date, startTime, endTime, notes } = req.body;
    const session = await StudySession.create({
      userId: req.user._id, subject, topic, date, startTime, endTime, notes
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudySession = async (req, res) => {
  try {
    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStudySession = async (req, res) => {
  try {
    await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── EXAMS ──
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user._id }).sort({ examDate: 1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { subject, examDate, startTime, venue, notes } = req.body;
    const exam = await Exam.create({
      userId: req.user._id, subject, examDate, startTime, venue, notes
    });
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};