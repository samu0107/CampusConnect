// models/TimeManagement.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
}, { timestamps: true });

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  examDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  venue: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  Assignment: mongoose.model('Assignment', assignmentSchema),
  StudySession: mongoose.model('StudySession', studySessionSchema),
  Exam: mongoose.model('Exam', examSchema),
};