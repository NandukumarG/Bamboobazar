-- Adds category image support, matching the existing products.image_url column.
ALTER TABLE categories
  ADD COLUMN image_url TEXT;
