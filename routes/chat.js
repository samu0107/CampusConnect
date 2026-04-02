// routes/chat.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  markAsRead,
} = require('../controllers/chatController');

router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;