const { Message, Conversation } = require('../models/Message');
const Accommodation = require('../models/Accommodation');

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { accommodationId } = req.body;
    const acc = await Accommodation.findById(accommodationId);
    if (!acc) return res.status(404).json({ success: false, message: 'Accommodation not found' });

    const ownerId = acc.owner.userId;
    const studentId = req.user._id;

    let conversation = await Conversation.findOne({ accommodationId, studentId, ownerId })
      .populate('accommodationId', 'title photos')
      .populate('studentId', 'name email')
      .populate('ownerId', 'name email');

    if (!conversation) {
      conversation = await Conversation.create({ accommodationId, studentId, ownerId });
      conversation = await Conversation.findById(conversation._id)
        .populate('accommodationId', 'title photos')
        .populate('studentId', 'name email')
        .populate('ownerId', 'name email');
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      $or: [{ studentId: userId }, { ownerId: userId }]
    })
      .populate('accommodationId', 'title photos')
      .populate('studentId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { conversationId } = req.params;

    const msg = await Message.create({
      conversationId,
      senderId: req.user._id,
      message
    });

    // Update conversation last message
    const conv = await Conversation.findById(conversationId);
    const isStudent = conv.studentId.toString() === req.user._id.toString();
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: new Date(),
      ...(isStudent ? { ownerUnread: conv.ownerUnread + 1 } : { studentUnread: conv.studentUnread + 1 })
    });

    const populated = await msg.populate('senderId', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conv = await Conversation.findById(conversationId);
    const isStudent = conv.studentId.toString() === req.user._id.toString();

    await Conversation.findByIdAndUpdate(conversationId, {
      ...(isStudent ? { studentUnread: 0 } : { ownerUnread: 0 })
    });

    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};