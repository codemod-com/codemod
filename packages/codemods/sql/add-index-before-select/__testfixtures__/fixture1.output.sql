CREATE INDEX idx_customer_id ON orders(customer_id);
SELECT * FROM orders WHERE customer_id = 123;
