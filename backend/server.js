require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { setIO } = require('./services/notification.service');
const chatSocket = require('./sockets/chat.socket');
const notificationSocket = require('./sockets/notification.socket');
const deadlineReminderJob = require('./jobs/deadlineReminder.job');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = initSocket(server);
    setIO(io);

    // Register socket handlers
    chatSocket(io);
    notificationSocket(io);

    // Start cron jobs
    deadlineReminderJob.start();
    logger.info('Deadline reminder cron job started');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 TMS Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📋 API: http://localhost:${PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      deadlineReminderJob.stop();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    });

    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
