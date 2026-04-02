// controllers/chatController.js
const { Message, Conversation } = require('../models/Message');
const Accommodation = require('../models/Accommodation');

// POST /api/chat/conversation
// Student calls this to get or create a conversation with the accommodation owner
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { accommodationId } = req.body;
    const studentId = req.user._id;

    const acc = await Accommodation.findById(accommodationId);
    if (!acc) return res.status(404).json({ success: false, message: 'Accommodation not found' });

    // ownerId = whoever created the accommodation (admin)
    const ownerId = acc.createdBy;
    if (!ownerId) return res.status(400).json({ success: false, message: 'Owner not found' });

    let conv = await Conversation.findOne({ accommodationId, studentId, ownerId })
      .populate('accommodationId', 'title photos')
      .populate('studentId', 'name email')
      .populate('ownerId', 'name email');

    if (!conv) {
      conv = await Conversation.create({ accommodationId, studentId, ownerId });
      conv = await Conversation.findById(conv._id)
        .populate('accommodationId', 'title photos')
        .populate('studentId', 'name email')
        .populate('ownerId', 'name email');
    }

    res.json({ success: true, data: conv });
  } catch (err) {
    console.error('getOrCreateConversation error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/conversations
// Returns all conversations for the logged-in user (student or admin)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('getUserConversations - userId:', userId.toString());

    const convs = await Conversation.find({
      $or: [{ studentId: userId }, { ownerId: userId }]
    })
      .populate('accommodationId', 'title photos')
      .populate('studentId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ lastMessageAt: -1 });

    console.log('conversations found:', convs.length);
    res.json({ success: true, data: convs });
  } catch (err) {
    console.error('getUserConversations error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/:conversationId/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/chat/:conversationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isStudent = conv.studentId.toString() === userId.toString();
    await Conversation.findByIdAndUpdate(conversationId, {
      ...(isStudent ? { studentUnread: 0 } : { ownerUnread: 0 })
    });

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('markAsRead error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};