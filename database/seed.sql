-- Bamboo Store — development seed data
--
-- Dev login credentials (password hashes below were generated with bcrypt, 10 rounds):
--   Admin:    admin@bamboostore.test    / Admin@12345
--   Customer: customer@bamboostore.test / Customer@12345

-- ============================================================
-- users
-- ============================================================
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('Bamboo Admin', 'admin@bamboostore.test', '9999999999',
   '$2b$10$RMLtsi8lncNjDNtFwBuCWO.1PvOtVYAPZIqE.2I0Hj7bTApK1KGMC', 'ADMIN'),
  ('Asha Verma', 'customer@bamboostore.test', '9876543210',
   '$2b$10$qofvvzfHq9D5UcXixVw5A.jIfTI4x3AeZcBezvTCIxsf7qeT5CQVi', 'CUSTOMER');

-- ============================================================
-- categories
-- ============================================================
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Home Decor', 'home-decor', 'Handcrafted bamboo pieces for everyday living spaces.', true),
  ('Lighting', 'lighting', 'Warm, sustainable bamboo lamps and lighting fixtures.', true),
  ('Planters', 'planters', 'Bamboo planters and pots for indoor greenery.', true),
  ('Storage & Organizers', 'storage-organizers', 'Bamboo baskets, trays and organizers.', true),
  ('Kitchen & Dining', 'kitchen-dining', 'Bamboo tableware and kitchen essentials.', true);

-- ============================================================
-- products
-- ============================================================
INSERT INTO products
  (category_id, name, slug, description, product_code, original_price, discount, selling_price, stock, image_url, is_listed)
VALUES
  ((SELECT id FROM categories WHERE slug = 'lighting'),
   'Bamboo Table Lamp', 'bamboo-table-lamp',
   'A warm, handwoven bamboo table lamp that brings soft ambient light to any room.',
   'BMB-LGT-001', 1499.00, 10.00, 1349.10, 25,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-table-lamp.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'lighting'),
   'Bamboo Pendant Light', 'bamboo-pendant-light',
   'A woven bamboo pendant shade that casts warm, dappled light across a room.',
   'BMB-LGT-002', 2199.00, 15.00, 1869.15, 15,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-pendant-light.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'home-decor'),
   'Bamboo Wall Clock', 'bamboo-wall-clock',
   'A minimalist wall clock with a solid bamboo frame and silent-sweep movement.',
   'BMB-DEC-001', 999.00, 5.00, 949.05, 40,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-wall-clock.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'home-decor'),
   'Bamboo Photo Frame Set', 'bamboo-photo-frame-set',
   'A set of three natural bamboo photo frames in varying sizes.',
   'BMB-DEC-002', 699.00, 0.00, 699.00, 60,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-photo-frame-set.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'planters'),
   'Bamboo Floor Planter', 'bamboo-floor-planter',
   'A tall floor-standing bamboo planter for indoor palms and ferns.',
   'BMB-PLN-001', 1799.00, 12.00, 1583.12, 20,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-floor-planter.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'planters'),
   'Bamboo Tabletop Planter', 'bamboo-tabletop-planter',
   'A compact bamboo planter suited to desks, shelves and windowsills.',
   'BMB-PLN-002', 649.00, 0.00, 649.00, 50,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-tabletop-planter.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'storage-organizers'),
   'Bamboo Storage Basket', 'bamboo-storage-basket',
   'A woven bamboo basket for laundry, throws, or general home storage.',
   'BMB-STO-001', 899.00, 8.00, 827.08, 35,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-storage-basket.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'storage-organizers'),
   'Bamboo Multi-Tier Organizer', 'bamboo-multi-tier-organizer',
   'A three-tier bamboo organizer for the kitchen, bathroom, or office.',
   'BMB-STO-002', 1899.00, 10.00, 1709.10, 18,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-multi-tier-organizer.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'kitchen-dining'),
   'Bamboo Dinnerware Set', 'bamboo-dinnerware-set',
   'A 4-piece bamboo fibre dinnerware set, lightweight and dishwasher-safe.',
   'BMB-KIT-001', 1299.00, 5.00, 1234.05, 22,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-dinnerware-set.jpg', true),

  ((SELECT id FROM categories WHERE slug = 'kitchen-dining'),
   'Bamboo Cutlery Set', 'bamboo-cutlery-set',
   'A travel-friendly bamboo cutlery set with a woven carry pouch.',
   'BMB-KIT-002', 549.00, 0.00, 549.00, 70,
   'https://res.cloudinary.com/demo/image/upload/bamboo/bamboo-cutlery-set.jpg', true);

-- ============================================================
-- sample order (demonstrates the full order → items → payment flow)
-- ============================================================
INSERT INTO orders
  (user_id, order_number, subtotal, shipping, total, status,
   customer_name, phone, email, address, city, state, pincode)
VALUES
  ((SELECT id FROM users WHERE email = 'customer@bamboostore.test'),
   'ORD-SEED0001', 3525.28, 0.00, 3525.28, 'PAID',
   'Asha Verma', '9876543210', 'customer@bamboostore.test',
   '221B Bamboo Lane', 'Pune', 'Maharashtra', '411001');

INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
  ((SELECT id FROM orders WHERE order_number = 'ORD-SEED0001'),
   (SELECT id FROM products WHERE slug = 'bamboo-table-lamp'),
   'Bamboo Table Lamp', 2, 1349.10),
  ((SELECT id FROM orders WHERE order_number = 'ORD-SEED0001'),
   (SELECT id FROM products WHERE slug = 'bamboo-storage-basket'),
   'Bamboo Storage Basket', 1, 827.08);

INSERT INTO payments (order_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES
  ((SELECT id FROM orders WHERE order_number = 'ORD-SEED0001'),
   'order_seed_demo0001', 'pay_seed_demo0001', 3525.28, 'PAID');
