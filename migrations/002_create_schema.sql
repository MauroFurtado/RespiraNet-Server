-- migrations/002_create_schema.sql
-- Cria nodes + tabelas de leituras
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    mac TEXT NOT NULL UNIQUE,
    description TEXT,
    last_seen TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS temperature_readings (
    id BIGSERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    value DOUBLE PRECISION,
    ts TIMESTAMP WITH TIME ZONE,
    raw JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS humidity_readings (
    id BIGSERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    value DOUBLE PRECISION,
    ts TIMESTAMP WITH TIME ZONE,
    raw JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS luminosity_readings (
    id BIGSERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    value DOUBLE PRECISION,
    ts TIMESTAMP WITH TIME ZONE,
    raw JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gas_readings (
    id BIGSERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    value DOUBLE PRECISION,
    ts TIMESTAMP WITH TIME ZONE,
    raw JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- índices
CREATE INDEX IF NOT EXISTS idx_nodes_mac ON nodes(mac);
CREATE INDEX IF NOT EXISTS idx_temp_node_ts ON temperature_readings(node_id, ts);
CREATE INDEX IF NOT EXISTS idx_humidity_node_ts ON humidity_readings(node_id, ts);
CREATE INDEX IF NOT EXISTS idx_lum_node_ts ON luminosity_readings(node_id, ts);
CREATE INDEX IF NOT EXISTS idx_gas_node_ts ON gas_readings(node_id, ts);

CREATE OR REPLACE FUNCTION update_node_last_seen() RETURNS trigger AS $$
BEGIN
  UPDATE nodes SET last_seen = COALESCE(NEW.ts, now())
    WHERE id = NEW.node_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_temp_update_last_seen
  AFTER INSERT ON temperature_readings
  FOR EACH ROW EXECUTE FUNCTION update_node_last_seen();
