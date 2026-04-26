-- Customer permissions
INSERT INTO permissions (permission_name) VALUES ('CART_CREATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CART_READ') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CART_DELETE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('ORDER_CREATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('ORDER_READ') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('INVOICE_READ') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CUSTOMER_LOGOUT') ON CONFLICT DO NOTHING;

-- Admin permissions
INSERT INTO permissions (permission_name) VALUES ('PRODUCT_CREATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('PRODUCT_UPDATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('PRODUCT_DELETE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CATEGORY_CREATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CATEGORY_UPDATE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('CATEGORY_DELETE') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('ADMIN_PRODUCTS_CUSTOMERS') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('ORDER_LIST') ON CONFLICT DO NOTHING;
INSERT INTO permissions (permission_name) VALUES ('ADMIN_LOGOUT') ON CONFLICT DO NOTHING;

-- Insert Roles
INSERT INTO roles (role_name) VALUES ('CUSTOMER') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('SUPER_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('VIEW_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('NO_DELETE_ADMIN') ON CONFLICT DO NOTHING;

-- CUSTOMER: Can create/read/delete cart, create/read orders, and read invoices
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_name = 'CUSTOMER' AND p.permission_name IN (
  'CART_CREATE', 'CART_READ', 'CART_DELETE',
  'ORDER_CREATE', 'ORDER_READ',
  'INVOICE_READ', 'CUSTOMER_LOGOUT'
) ON CONFLICT DO NOTHING;

-- SUPER_ADMIN: Has ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_name = 'SUPER_ADMIN' ON CONFLICT DO NOTHING;

-- VIEW_ADMIN: Can only view products, categories, orders, invoices
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_name = 'VIEW_ADMIN' AND p.permission_name IN (
  'ORDER_LIST',
  'INVOICE_READ',
  'ADMIN_PRODUCTS_CUSTOMERS',
  'ADMIN_LOGOUT'
) ON CONFLICT DO NOTHING;

-- NO_DELETE_ADMIN: Full access except delete permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_name = 'NO_DELETE_ADMIN' AND p.permission_name NOT IN (
  'PRODUCT_DELETE',
  'CATEGORY_DELETE',
  'CART_DELETE'
) ON CONFLICT DO NOTHING;
