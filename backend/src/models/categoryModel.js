const pool = require('../config/db')

const findActiveCategories = async () => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
  )
  return result.rows
}

const findActiveBySlug = async (slug) => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
    [slug]
  )
  return result.rows[0]
}

// Admin-facing queries return every category regardless of is_active status.
const findAllAdmin = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC')
  return result.rows
}

const findByIdAdmin = async (id) => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
  return result.rows[0]
}

const createCategory = async ({ name, slug, description, imageUrl, isActive }) => {
  const result = await pool.query(
    `INSERT INTO categories (name, slug, description, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, slug, description, imageUrl, isActive]
  )
  return result.rows[0]
}

const updateCategory = async (id, { name, slug, description, imageUrl }) => {
  const result = await pool.query(
    `UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4
     WHERE id = $5
     RETURNING *`,
    [name, slug, description, imageUrl, id]
  )
  return result.rows[0]
}

const updateStatus = async (id, isActive) => {
  const result = await pool.query('UPDATE categories SET is_active = $1 WHERE id = $2 RETURNING *', [
    isActive,
    id,
  ])
  return result.rows[0]
}

module.exports = {
  findActiveCategories,
  findActiveBySlug,
  findAllAdmin,
  findByIdAdmin,
  createCategory,
  updateCategory,
  updateStatus,
}
