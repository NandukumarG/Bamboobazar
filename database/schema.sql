-- Bamboo Store — PostgreSQL schema
-- 6 tables: users, categories, products, orders, order_items, payments

-- Shared trigger: keep updated_at current on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  phone          VARCHAR(20),
  password_hash  VARCHAR(255) NOT NULL,
  avatar_url     TEXT,
  role           VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
                 CHECK (role IN ('CUSTOMER', 'ADMIN')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE categories (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(170) NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- products
-- ============================================================
CREATE TABLE products (
  id               SERIAL PRIMARY KEY,
  category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name             VARCHAR(200) NOT NULL,
  slug             VARCHAR(220) NOT NULL UNIQUE,
  description      TEXT,
  product_code     VARCHAR(50) NOT NULL UNIQUE,
  original_price   NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  discount         NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  selling_price    NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url        TEXT,
  is_listed        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_listed ON products(is_listed);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE orders (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  order_number   VARCHAR(30) NOT NULL UNIQUE,
  subtotal       NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total          NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'SHIPPED', 'DELIVERED')),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE'
                 CHECK (payment_method IN ('ONLINE', 'COD')),
  customer_name  VARCHAR(150) NOT NULL,
  phone          VARCHAR(20) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  address        TEXT NOT NULL,
  city           VARCHAR(100) NOT NULL,
  state          VARCHAR(100) NOT NULL,
  pincode        VARCHAR(15) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name   VARCHAR(200) NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0), -- price at time of purchase
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- payments
-- ============================================================
CREATE TABLE payments (
  id                    SERIAL PRIMARY KEY,
  order_id              INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id     VARCHAR(100),
  razorpay_payment_id   VARCHAR(100),
  amount                NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status                VARCHAR(20) NOT NULL DEFAULT 'CREATED'
                        CHECK (status IN ('CREATED', 'PAID', 'FAILED')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
