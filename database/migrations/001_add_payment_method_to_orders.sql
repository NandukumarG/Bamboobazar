-- Adds Cash on Delivery support: orders can now be placed with either
-- online (Razorpay) or cash-on-delivery payment.
ALTER TABLE orders
  ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE'
  CHECK (payment_method IN ('ONLINE', 'COD'));
