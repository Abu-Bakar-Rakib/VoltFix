import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { setupSocketIO } from './config/socket';
import { checkDatabaseConnection } from './config/db';
import { initializeMockData } from './repositories/mockStore';

async function bootstrap() {
  const server = http.createServer(app);

  // Initialize Socket.io
  setupSocketIO(server, env.CLIENT_URL);

  // Initialize Database / In-Memory Mock store
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    logger.info('Initializing VoltFix in-memory persistent store with full seed dataset...');
    await initializeMockData();
    logger.info('✅ In-memory database ready (10 Electricians, 10 Customers, Admin, Bookings, Reviews)');
  }

  // Start HTTP listening
  server.listen(env.PORT, () => {
    logger.info(`⚡ VoltFix API server running on http://localhost:${env.PORT}`);
    logger.info(`📚 Swagger Documentation active at http://localhost:${env.PORT}/api/docs`);
    logger.info(`🌐 Socket.io gateway ready for real-time chat & notifications`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Closing HTTP server gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error during server startup');
  process.exit(1);
});
