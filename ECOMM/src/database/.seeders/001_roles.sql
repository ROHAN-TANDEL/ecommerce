INSERT INTO master.roles (name, description)
VALUES
    ('ADMIN', 'System administrator'),
    ('CUSTOMER', 'Customer user'),
    ('STAFF', 'Staff user')
ON CONFLICT (name) DO NOTHING;
