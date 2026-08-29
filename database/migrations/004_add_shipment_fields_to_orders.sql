-- Tracks Shiprocket shipment/invoice info once an order ships.
ALTER TABLE orders
  ADD COLUMN shiprocket_order_id BIGINT,
  ADD COLUMN shiprocket_shipment_id BIGINT,
  ADD COLUMN awb_code VARCHAR(50),
  ADD COLUMN courier_name VARCHAR(100),
  ADD COLUMN tracking_url TEXT,
  ADD COLUMN invoice_url TEXT;
