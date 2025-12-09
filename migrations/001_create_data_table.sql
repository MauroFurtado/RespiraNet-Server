CREATE TABLE IF NOT EXISTS data_table (
    id SERIAL PRIMARY KEY,
    device_id TEXT,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    luminosity DOUBLE PRECISION,
    gas_level DOUBLE PRECISION,
    sensor_state BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);