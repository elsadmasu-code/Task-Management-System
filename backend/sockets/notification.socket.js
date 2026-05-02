const logger = require('../utils/logger');

const notificationSocket = (io) => {
  io.on('connection', (socket) => {
    // User joins their personal notification room on auth
    socket.on('notification:join', (userId) => {
      socket.join(`notif:${userId}`);
      logger.info(`User ${userId} joined notification room`);
    });

    // Mark notification as read from client
    socket.on('notification:read', ({ notificationId, userId }) => {
      // Optionally broadcast to other tabs/devices of same user
      socket.to(`notif:${userId}`).emit('notification:read', { notificationId });
    });

    // Task real-time updates for project members
    socket.on('task:join', (projectId) => {
      socket.join(`task:${projectId}`);
    });

    socket.on('task:leave', (projectId) => {
      socket.leave(`task:${projectId}`);
    });
  });
};

module.exports = notificationSocket;
