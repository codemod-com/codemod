Example of using codemod that changes SQL.
It detects all SELECT statements and adds an index creation statement before them.
Inside SELECT statement for any fields that ends with `_id` it creates an index on that field.

## Example

### Before

```sql
select * FROM orders WHERE customer_id = 123;
```

### After

```ts
CREATE INDEX idx_customer_id ON orders(customer_id);
SELECT * FROM orders WHERE customer_id = 123;
```

