CREATE TABLE IF NOT EXISTS inspecoes (
    id UUID PRIMARY KEY,
    nome_imovel VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    area_m2 NUMERIC(10, 2) NOT NULL,
    observacoes TEXT,
    status_sync VARCHAR(20) NOT NULL DEFAULT 'pendente',
    created_at BIGINT NOT NULL,
    synced_at BIGINT
)