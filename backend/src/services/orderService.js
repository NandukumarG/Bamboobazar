const pool = require('../config/db')
const productModel = require('../models/productModel')
const orderModel = require('../models/orderModel')
const orderItemModel = require('../models/orderItemModel')
const ApiError = require('../utils/ApiError')
const generateOrderNumber = require('../utils/orderNumber')

const SHIPPING_FLAT_RATE = 0

const createOrder = async ({
  userId,
  items,
  paymentMethod = 'ONLINE',
  customerName,
  phone,
  email,
  address,
  city,
  state,
  pincode,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    let subtotal = 0
    const preparedItems = []

    for (const item of items) {
      const product = await productModel.findByIdForOrder(item.productId, client)

      if (!product || !product.is_listed) {
        throw new ApiError(400, `Product ${item.productId} is not available`)
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`)
      }

      const price = Number(product.selling_price)
      subtotal += price * item.quantity

      preparedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price,
      })

      await productModel.decrementStock(product.id, item.quantity, client)
    }

    const shipping = SHIPPING_FLAT_RATE
    const total = subtotal + shipping

    const order = await orderModel.createOrder(
      {
        userId,
        orderNumber: generateOrderNumber(),
        subtotal,
        shipping,
        total,
        status: 'PENDING',
        paymentMethod,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
      },
      client
    )

    for (const item of preparedItems) {
      await orderItemModel.createOrderItem({ orderId: order.id, ...item }, client)
    }

    await client.query('COMMIT')

    return { ...order, items: preparedItems }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { createOrder }
