CREATE TABLE IF NOT EXISTS master.audit_logs (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 event_id UUID NOT NULL UNIQUE,
                                                 correlation_id UUID NOT NULL,
                                                 user_id BIGINT,
                                                 action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    metadata JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON master.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON master.audit_logs (entity, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON master.audit_logs (user_id);