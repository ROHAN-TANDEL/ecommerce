CREATE TABLE IF NOT EXISTS master.refresh_tokens (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     user_id BIGINT NOT NULL,
                                                     token TEXT NOT NULL,
                                                     expires_at TIMESTAMPTZ NOT NULL,
                                                     revoked_at TIMESTAMPTZ,
                                                     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES master.users(id)
    );