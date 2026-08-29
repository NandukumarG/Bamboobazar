-- Adds customer profile picture support.
ALTER TABLE users
  ADD COLUMN avatar_url TEXT;
