const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUserConversations,
  markAsRead
} = require('../controllers/chatController');

router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;