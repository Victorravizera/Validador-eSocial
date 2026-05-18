CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  plan          VARCHAR(20) NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  monthly_quota INTEGER NOT NULL DEFAULT 5000,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  password_salt VARCHAR(32) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apenas o hash da key é armazenado — nunca o valor original
CREATE TABLE api_keys (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_hash     VARCHAR(255) NOT NULL UNIQUE,
  name         VARCHAR(100),
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logs sem dados pessoais do trabalhador (LGPD)
CREATE TABLE validation_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id),
  batch_id     UUID,
  event_id     VARCHAR(10) NOT NULL,
  status       VARCHAR(4) NOT NULL CHECK (status IN ('PASS', 'FAIL', 'WARN')),
  score        SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  total_rules  SMALLINT NOT NULL,
  passed_rules SMALLINT NOT NULL,
  issue_count  SMALLINT NOT NULL DEFAULT 0,
  duration_ms  SMALLINT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quota_usage (
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  year_month CHAR(7) NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, year_month)
);

CREATE INDEX idx_validation_logs_tenant ON validation_logs(tenant_id, created_at DESC);
CREATE INDEX idx_validation_logs_batch  ON validation_logs(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_api_keys_tenant        ON api_keys(tenant_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_tenant_users_email     ON tenant_users(email);
