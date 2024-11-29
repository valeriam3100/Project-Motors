
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
    user: 'montoya8728',
    host: '143.198.247.195',
    database: 'montoya8728',
    password: '309668728',
    port: 5432, // El puerto por defecto de PostgreSQL
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
 };