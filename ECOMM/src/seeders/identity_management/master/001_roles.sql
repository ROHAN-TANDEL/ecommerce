INSERT INTO master.roles (name, code, description)
VALUES
    ('Super Admin','SUPER_ADMIN', 'System super administrator'),
    ('Admin','ADMIN', 'System administrator'),
    ('Customer','CUSTOMER', 'Customer user'),
    ('Client','CLIENT', 'Client user'),
    ('Partner','PARTNER', 'Partner user'),
    ('Staff','STAFF', 'Staff user'),
    ('System','SYSTEM', 'System bot')
    ON CONFLICT (name) DO NOTHING;
