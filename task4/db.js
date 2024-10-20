const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DistMINiO',
  password: 'Serik2004',
  port: 5432,
});

module.exports = pool;