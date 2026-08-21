const pool = require('../config/db')

const findListedProducts = async ({ categorySlug, search, limit = 20, offset = 0 }) => {
  const conditions = ['p.is_listed = true']
  const values = []

  if (categorySlug) {
    values.push(categorySlug)
    conditions.push(`c.slug = $${values.length}`)
  }

  if (search) {
    values.push(`%${search}%`)
    conditions.push(`p.name ILIKE $${values.length}`)
  }

  values.push(limit)
  const limitIndex = values.length
  values.push(offset)
  const offsetIndex = values.length

  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  )
  return result.rows
}

const findListedById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1 AND p.is_listed = true`,
    [id]
  )
  return result.rows[0]
}

// Locks the row for the duration of the order transaction so concurrent
// checkouts can't oversell the same stock.
const findByIdForOrder = async (id, client = pool) => {
  const result = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id])
  return result.rows[0]
}

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])
  return result.rows[0]
}

const decrementStock = async (id, quantity, client = pool) => {
  await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, id])
}

// Admin-facing queries return every product regardless of is_listed status.
const findAllAdmin = async () => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.created_at DESC`
  )
  return result.rows
}

const findByIdAdmin = async (id) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [id]
  )
  return result.rows[0]
}

const createProduct = async (data) => {
  const result = await pool.query(
    `INSERT INTO products
      (category_id, name, slug, description, product_code, original_price, discount, selling_price, stock, image_url, is_listed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.categoryId,
      data.name,
      data.slug,
      data.description,
      data.productCode,
      data.originalPrice,
      data.discount,
      data.sellingPrice,
      data.stock,
      data.imageUrl,
      data.isListed,
    ]
  )
  return result.rows[0]
}

const updateProduct = async (id, data) => {
  const result = await pool.query(
    `UPDATE products SET
       category_id = $1,
       name = $2,
       slug = $3,
       description = $4,
       product_code = $5,
       original_price = $6,
       discount = $7,
       selling_price = $8,
       stock = $9,
       image_url = $10
     WHERE id = $11
     RETURNING *`,
    [
      data.categoryId,
      data.name,
      data.slug,
      data.description,
      data.productCode,
      data.originalPrice,
      data.discount,
      data.sellingPrice,
      data.stock,
      data.imageUrl,
      id,
    ]
  )
  return result.rows[0]
}

const updateStatus = async (id, isListed) => {
  const result = await pool.query('UPDATE products SET is_listed = $1 WHERE id = $2 RETURNING *', [
    isListed,
    id,
  ])
  return result.rows[0]
}

const deleteProduct = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
  return result.rows[0]
}

module.exports = {
  findListedProducts,
  findListedById,
  findByIdForOrder,
  findById,
  decrementStock,
  findAllAdmin,
  findByIdAdmin,
  createProduct,
  updateProduct,
  updateStatus,
  deleteProduct,
}
