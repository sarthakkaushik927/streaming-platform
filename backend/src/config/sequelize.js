const { Sequelize } = require('sequelize');
const config = require('./config.js');

const env = process.env.NODE_ENV || 'local';
const dbConfig = config[env];

const options = {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  define: { schema: config.schema },
  logging: false,
  pool: {
    max: 15,
    // Keep no idle connections, so a serverless database like Neon can suspend when unused.
    min: 0,
    acquire: 60000,
    idle: 10000
  }
};

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, options)
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, options);

module.exports = sequelize;
