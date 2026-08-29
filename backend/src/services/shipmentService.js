const shiprocket = require('../config/shiprocket')
const orderModel = require('../models/orderModel')
const orderItemModel = require('../models/orderItemModel')
const ApiError = require('../utils/ApiError')
const { shiprocketRequest } = require('./shiprocketClient')

const skuFor = (item) => (item.product_id ? `PROD-${item.product_id}` : `ITEM-${item.id}`)

// Shiprocket requires a first + last name; reuse the first name when there
// isn't a second word rather than sending an empty last name.
const splitName = (fullName) => {
  const [first, ...rest] = fullName.trim().split(/\s+/)
  return { firstName: first, lastName: rest.join(' ') || first }
}

const createShipmentOrder = async (order, items) => {
  const { firstName, lastName } = splitName(order.customer_name)

  const body = {
    order_id: order.order_number,
    order_date: order.created_at.toISOString().slice(0, 16).replace('T', ' '),
    pickup_location: shiprocket.pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.address,
    billing_city: order.city,
    billing_pincode: order.pincode,
    billing_state: order.state,
    billing_country: 'India',
    billing_email: order.email,
    billing_phone: order.phone,
    shipping_is_billing: true,
    order_items: items.map((item) => ({
      name: item.product_name,
      sku: skuFor(item),
      units: item.quantity,
      selling_price: Number(item.price),
    })),
    payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
    sub_total: Number(order.subtotal),
    length: shiprocket.defaultLengthCm,
    breadth: shiprocket.defaultBreadthCm,
    height: shiprocket.defaultHeightCm,
    weight: shiprocket.defaultWeightKg,
  }

  const { ok, data } = await shiprocketRequest('orders/create/adhoc', { method: 'POST', body })

  if (!ok || !data?.shipment_id) {
    throw new ApiError(502, data?.message || 'Failed to create the shipment with the courier service')
  }

  return { shiprocketOrderId: data.order_id, shipmentId: data.shipment_id }
}

const assignAwb = async (shipmentId) => {
  const { ok, data } = await shiprocketRequest('courier/assign/awb', {
    method: 'POST',
    body: { shipment_id: shipmentId },
  })

  const details = data?.response?.data
  if (!ok || Number(data?.awb_assign_status) !== 1 || !details?.awb_code) {
    throw new ApiError(502, data?.message || 'Could not assign a courier for this shipment')
  }

  return { awbCode: details.awb_code, courierName: details.courier_name || null }
}

const requestPickup = async (shipmentId) => {
  const { ok, data } = await shiprocketRequest('courier/generate/pickup', {
    method: 'POST',
    body: { shipment_id: [shipmentId] },
  })

  // Pickup can fail to schedule for reasons that don't invalidate the
  // shipment itself (e.g. today's courier cutoff has passed) — don't fail
  // the whole flow over it, since the invoice/AWB are already valid.
  if (!ok || Number(data?.pickup_status) !== 1) {
    console.warn('Shiprocket pickup request did not confirm:', data?.message || data)
  }
}

const generateInvoice = async (shiprocketOrderId) => {
  const { ok, data } = await shiprocketRequest('orders/print/invoice', {
    method: 'POST',
    body: { ids: [shiprocketOrderId] },
  })

  if (!ok || !data?.invoice_url) {
    throw new ApiError(502, data?.message || 'Could not generate the invoice')
  }

  return data.invoice_url
}

// Creates the shipment in Shiprocket for a paid (or COD) order: registers
// the order, assigns a courier + AWB, schedules pickup, and generates the
// invoice PDF — then saves the returned identifiers on the order row.
const createShipment = async (orderId) => {
  const order = await orderModel.findOrderById(orderId)
  if (!order) throw new ApiError(404, 'Order not found')

  if (order.shiprocket_order_id) {
    return order // already shipped — idempotent no-op
  }
  if (order.status === 'CANCELLED') {
    throw new ApiError(400, 'Cannot create a shipment for a cancelled order')
  }
  if (order.payment_method === 'ONLINE' && order.status !== 'PAID') {
    throw new ApiError(400, 'Order must be paid before creating a shipment')
  }

  const items = await orderItemModel.findItemsByOrderId(orderId)
  if (items.length === 0) {
    throw new ApiError(400, 'Order has no items')
  }

  const { shiprocketOrderId, shipmentId } = await createShipmentOrder(order, items)
  const { awbCode, courierName } = await assignAwb(shipmentId)
  await requestPickup(shipmentId)
  const invoiceUrl = await generateInvoice(shiprocketOrderId)

  return orderModel.saveShipment(orderId, {
    shiprocketOrderId,
    shipmentId,
    awbCode,
    courierName,
    trackingUrl: `https://shiprocket.co/tracking/${awbCode}`,
    invoiceUrl,
  })
}

module.exports = { createShipment }
