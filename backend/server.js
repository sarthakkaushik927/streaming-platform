const http = require('http');
const { Server } = require('socket.io');
const app = require('./app.js');
const sequelize = require('./src/config/sequelize.js');
const { schema } = require('./src/config/config.js');
// Ensure all database models are loaded and registered
require('./src/models/index.js');
const registerSocketHandlers = require('./src/websockets/socketHandlers.js');
const logger = require('./src/utilities/logger.js');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Authenticate and Synchronize Database
    await sequelize.authenticate();
    logger.info('"server.js","startServer()","SyncStream Database connected successfully"');
    
    // Create the app's own schema, then any missing tables inside it. Nothing outside it is changed.
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await sequelize.sync({ alter: false });

    // sync() doesn't add columns to existing tables, so add this one to rooms created before it existed.
    await sequelize.query(`ALTER TABLE "${schema}"."rooms" ADD COLUMN IF NOT EXISTS "created_by" UUID`);
    await sequelize.query(`UPDATE "${schema}"."rooms" SET "created_by" = "host_id" WHERE "created_by" IS NULL`);
    logger.info('"server.js","startServer()","Database models synchronized"');

    const server = http.createServer(app);
    const allowedOrigins = [
      'http://localhost:5173'
    ];
    const corsOrigin = process.env.CORS_ORIGIN || '*';

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (corsOrigin === '*' || allowedOrigins.includes(origin) || origin === corsOrigin) {
            return callback(null, true);
          }
          return callback(null, false);
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Bind real-time socket events
    registerSocketHandlers(io);

    // 3. Listen on port
    server.listen(port, () => {
      logger.info(`"server.js","startServer()","Server running on port ${port}"`);
    });
  } catch (error) {
    logger.error(`"server.js","startServer()","Initialization failed: ${error.message}"`);
    process.exit(1);
  }
}

startServer();
