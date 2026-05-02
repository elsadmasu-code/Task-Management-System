const Message = require('../models/Message');
const logger = require('../utils/logger');

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    // Join project chat room
    socket.on('chat:join', (projectId) => {
      socket.join(`chat:${projectId}`);
      logger.info(`Socket ${socket.id} joined chat room: chat:${projectId}`);
    });

    socket.on('chat:leave', (projectId) => {
      socket.leave(`chat:${projectId}`);
    });

    // Typing indicator
    socket.on('chat:typing', ({ projectId, userId, userName }) => {
      socket.to(`chat:${projectId}`).emit('chat:typing', { userId, userName });
    });

    socket.on('chat:stopTyping', ({ projectId, userId }) => {
      socket.to(`chat:${projectId}`).emit('chat:stopTyping', { userId });
    });

    // Direct message typing
    socket.on('dm:typing', ({ receiverId, senderId, senderName }) => {
      socket.to(receiverId).emit('dm:typing', { senderId, senderName });
    });

    socket.on('dm:stopTyping', ({ receiverId, senderId }) => {
      socket.to(receiverId).emit('dm:stopTyping', { senderId });
    });

    // Message reaction
    socket.on('message:react', ({ messageId, emoji, userId, projectId }) => {
      if (projectId) {
        socket.to(`chat:${projectId}`).emit('message:reacted', { messageId, emoji, userId });
      }
    });
  });
};

module.exports = chatSocket;
