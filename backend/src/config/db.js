const { Pool } = require('pg')

// Hosted Postgres providers (Neon, Supabase, Render) require SSL and use
// certificates not in Node's default trust store — reject-unauthorized:false
// still encrypts the connection, it just skips CA verification.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

module.exports = pool
