INSERT INTO health_checks (status)
VALUES
    ('healthy')
    ON CONFLICT (name) DO NOTHING;