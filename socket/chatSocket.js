const { Message, Conversation } = require('../models/Message');

module.exports = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User comes online
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Send message
    socket.on('send_message', async ({ conversationId, senderId, message }) => {
      try {
        const msg = await Message.create({ conversationId, senderId, message });

        const conv = await Conversation.findById(conversationId);
        const isStudent = conv.studentId.toString() === senderId.toString();
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message,
          lastMessageAt: new Date(),
          ...(isStudent ? { ownerUnread: conv.ownerUnread + 1 } : { studentUnread: conv.studentUnread + 1 })
        });

        const populated = await msg.populate('senderId', 'name');

        // Emit to everyone in the room
        io.to(conversationId).emit('receive_message', populated);

        // Notify if the other user is online but not in the room
        const otherUserId = isStudent
          ? conv.ownerId.toString()
          : conv.studentId.toString();
        const otherSocketId = onlineUsers.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('new_message_notification', {
            conversationId,
            message,
            from: senderId
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', () => {
      if (socket.userId) onlineUsers.delete(socket.userId);
      console.log('Socket disconnected:', socket.id);
    });
  });
};