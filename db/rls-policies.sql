-- Row Level Security policies for Supabase

-- Users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Stores
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins and store managers can manage stores"
  ON stores FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'store_manager'));

-- Products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Store managers can manage own products"
  ON products FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (
      auth.jwt() ->> 'role' = 'store_manager'
      AND store_id IN (
        SELECT id FROM stores WHERE id = products.store_id
      )
    )
  );

-- Orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Delivery partners can view assigned orders"
  ON orders FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'delivery'
    AND id IN (
      SELECT order_id FROM deliveries WHERE delivery_partner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Deliveries
CREATE POLICY "Users can view own delivery"
  ON deliveries FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
    OR delivery_partner_id = auth.uid()
  );

CREATE POLICY "Delivery partners can update own deliveries"
  ON deliveries FOR UPDATE
  USING (delivery_partner_id = auth.uid());

-- Delivery Partners
CREATE POLICY "Delivery partners can view own profile"
  ON delivery_partners FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Delivery partners can update own status"
  ON delivery_partners FOR UPDATE
  USING (user_id = auth.uid());
