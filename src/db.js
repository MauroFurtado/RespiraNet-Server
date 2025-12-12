const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
  host: config.pg.host,
  port: config.pg.port,
  database: config.pg.database,
  user: config.pg.user,
  password: config.pg.password
});

async function ensureNode(mac) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO nodes (mac, last_seen)
       VALUES ($1, now())
       ON CONFLICT (mac) DO UPDATE SET last_seen = now()
       RETURNING id`,
      [mac]
    );
    return res.rows[0].id;
  } finally {
    client.release();
  }
}

async function insertTemperature(nodeId, value, ts, raw) {
  await pool.query(
    `INSERT INTO temperature_readings (node_id, value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}

async function insertHumidity(nodeId, value, ts, raw) {
  await pool.query(
    `INSERT INTO humidity_readings (node_id, value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}

async function insertLuminosity(nodeId, value, ts, raw) {
  await pool.query(
    `INSERT INTO luminosity_readings (node_id, value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}

async function insertGas(nodeId, value, ts, raw) {
  await pool.query(
    `INSERT INTO gas_readings (node_id,value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}

module.exports = {
  pool,
  ensureNode,
  insertTemperature,
  insertHumidity,
  insertLuminosity,
  insertGas
};
