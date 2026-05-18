CREATE TABLE IF NOT EXISTS anexos (
    id UUID PRIMARY KEY,
    inspecao_id UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    synced_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anexos_inspecao_id ON anexos(inspecao_id);