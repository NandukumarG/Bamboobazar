-- Revert order tracking metadata columns if needed by a fresh DB setup.
ALTER TABLE orders
  DROP COLUMN IF EXISTS shiprocket_order_id,
  DROP COLUMN IF EXISTS shiprocket_shipment_id,
  DROP COLUMN IF EXISTS awb_code,
  DROP COLUMN IF EXISTS courier_name,
  DROP COLUMN IF EXISTS tracking_url,
  DROP COLUMN IF EXISTS invoice_url;
