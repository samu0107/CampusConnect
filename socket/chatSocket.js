// socket/chatSocket.js
const { Message, Conversation } = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User comes online
    socket.on('user_online', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      }
    });

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
        console.log(`Socket ${socket.id} joined conv_${conversationId}`);
      }
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, message } = data;
        if (!conversationId || !senderId || !message) return;

        // Save to DB
        const msg = await Message.create({ conversationId, senderId, message });
        const populated = await Message.findById(msg._id).populate('senderId', 'name email');

        // Update conversation
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          const isStudent = conv.studentId.toString() === senderId.toString();
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message,
            lastMessageAt: new Date(),
            ...(isStudent ? { ownerUnread: (conv.ownerUnread || 0) + 1 } : { studentUnread: (conv.studentUnread || 0) + 1 })
          });

          // Emit to everyone in conversation room
          io.to(`conv_${conversationId}`).emit('receive_message', populated);

          // Notify the other party in their personal room
          const otherUserId = isStudent ? conv.ownerId.toString() : conv.studentId.toString();
          io.to(`user_${otherUserId}`).emit('new_message_notification', {
            conversationId,
            message,
            senderId
          });
        }
      } catch (err) {
        console.error('send_message socket error:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userId }) => {
      if (conversationId && userId) {
        socket.to(`conv_${conversationId}`).emit('user_typing', { userId });
      }
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      if (conversationId && userId) {
        socket.to(`conv_${conversationId}`).emit('user_stop_typing', { userId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};