require('dotenv').config();

const config = {
  // All tables live in this schema, so the app can share a database without touching other tables.
  schema: 'syncstream',
  local: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'syncstream',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true }
    }
  }
};

module.exports = config;
