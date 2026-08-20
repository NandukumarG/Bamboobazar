const pool = require('../config/db')

const createUser = async ({ name, email, phone, passwordHash, role = 'CUSTOMER' }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role, created_at`,
    [name, email, phone, passwordHash, role]
  )
  return result.rows[0]
}

const findByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0]
}

const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

module.exports = { createUser, findByEmail, findById }
