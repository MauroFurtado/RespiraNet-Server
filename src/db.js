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
    `INSERT INTO gas_readings (node_id, value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}

// === FUNÇÕES PARA A API REST ===

// Helper para inferir tipo de gás a partir do payload bruto
function inferGasTypeFromRaw(raw) {
  try {
    if (raw && typeof raw === 'object') {
      const candidate = (raw.type || raw.sensor || raw.kind || '').toLowerCase();
      if (candidate) return candidate;
    }
    const text = JSON.stringify(raw || '').toLowerCase();
    if (text.includes('mq135')) return 'mq135';
    if (text.includes('mq2')) return 'mq2';
    if (text.includes('gas')) return 'gas';
  } catch (_) {}
  return null;
}

// Classificação simples de qualidade do ar baseada no valor do gás
function classifyAirQuality(value) {
  if (value == null || isNaN(value)) return 'unknown';
  if (value < 100) return 'safe';
  if (value < 300) return 'warning';
  return 'critical';
}

async function getAllNodes() {
  const res = await pool.query(
    `SELECT 
      id,
      mac,
      description,
      last_seen,
      CASE WHEN last_seen >= now() - interval '5 minutes' THEN 'online' ELSE 'offline' END AS status
    FROM nodes 
    ORDER BY last_seen DESC`
  );
  return res.rows;
}

async function getNodeById(id) {
  const res = await pool.query(
    `SELECT 
      id,
      mac,
      description,
      last_seen,
      CASE WHEN last_seen >= now() - interval '5 minutes' THEN 'online' ELSE 'offline' END AS status
    FROM nodes 
    WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function getNodeByMac(mac) {
  const res = await pool.query(
    `SELECT 
      id,
      mac,
      description AS name,
      description,
      last_seen,
      CASE WHEN last_seen >= now() - interval '5 minutes' THEN 'online' ELSE 'offline' END AS status
    FROM nodes 
    WHERE mac = $1`,
    [mac]
  );
  return res.rows[0] || null;
}

async function getNodeStatus(id) {
  const node = await getNodeById(id);
  if (!node) return null;

  const lastTemp = await pool.query(
    `SELECT value, ts FROM temperature_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [id]
  );
  
  const lastHumidity = await pool.query(
    `SELECT value, ts FROM humidity_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [id]
  );

  const lastLuminosity = await pool.query(
    `SELECT value, ts FROM luminosity_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [id]
  );

  const lastGas = await pool.query(
    `SELECT value, ts, raw FROM gas_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [id]
  );

  const gas = lastGas.rows[0] || null;
  const gasType = gas ? inferGasTypeFromRaw(gas.raw) : null;
  const airQuality = classifyAirQuality(gas?.value);

  return {
    ...node,
    air_quality: airQuality,
    sensors: {
      temperature: lastTemp.rows[0] || null,
      humidity: lastHumidity.rows[0] || null,
      luminosity: lastLuminosity.rows[0] || null,
      gas: gas ? { value: gas.value, ts: gas.ts, type: gasType } : null
    }
  };
}

async function getTemperatureReadings(nodeId, limit = 100, offset = 0) {
  let query = `SELECT node_id, value, ts FROM temperature_readings`;
  const params = [];
  
  if (nodeId) {
    query += ` WHERE node_id = $1`;
    params.push(nodeId);
  }
  
  query += ` ORDER BY ts DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const res = await pool.query(query, params);
  return res.rows;
}

async function getHumidityReadings(nodeId, limit = 100, offset = 0) {
  let query = `SELECT node_id, value, ts FROM humidity_readings`;
  const params = [];
  
  if (nodeId) {
    query += ` WHERE node_id = $1`;
    params.push(nodeId);
  }
  
  query += ` ORDER BY ts DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const res = await pool.query(query, params);
  return res.rows;
}

async function getLuminosityReadings(nodeId, limit = 100, offset = 0) {
  let query = `SELECT node_id, value, ts FROM luminosity_readings`;
  const params = [];
  
  if (nodeId) {
    query += ` WHERE node_id = $1`;
    params.push(nodeId);
  }
  
  query += ` ORDER BY ts DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const res = await pool.query(query, params);
  return res.rows;
}

async function getGasReadings(nodeId, gasType, limit = 100, offset = 0) {
  let query = `SELECT 
    node_id, 
    value, 
    ts,
    COALESCE(raw->>'type',
      CASE 
        WHEN raw::text ILIKE '%mq135%' THEN 'mq135'
        WHEN raw::text ILIKE '%mq2%' THEN 'mq2'
        WHEN raw::text ILIKE '%gas%' THEN 'gas'
        ELSE NULL
      END
    ) AS type
  FROM gas_readings`;
  const params = [];
  
  if (nodeId) {
    query += ` WHERE node_id = $1`;
    params.push(nodeId);
  }
  
  if (gasType) {
    const idx = params.length + 1;
    if (params.length > 0) {
      query += ` AND (COALESCE(raw->>'type', raw::text) ILIKE $${idx})`;
    } else {
      query += ` WHERE (COALESCE(raw->>'type', raw::text) ILIKE $${idx})`;
    }
    params.push(`%${gasType}%`);
  }
  
  query += ` ORDER BY ts DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const res = await pool.query(query, params);
  return res.rows;
}

async function getLatestReadings(nodeId) {
  const node = await getNodeById(nodeId);
  if (!node) return null;

  const temp = await pool.query(
    `SELECT value, ts FROM temperature_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [nodeId]
  );

  const humidity = await pool.query(
    `SELECT value, ts FROM humidity_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [nodeId]
  );

  const luminosity = await pool.query(
    `SELECT value, ts FROM luminosity_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 1`,
    [nodeId]
  );

  const gas = await pool.query(
    `SELECT value, ts, raw FROM gas_readings WHERE node_id = $1 ORDER BY ts DESC LIMIT 5`,
    [nodeId]
  );

  const gasRows = gas.rows.map(r => ({
    value: r.value,
    ts: r.ts,
    type: inferGasTypeFromRaw(r.raw)
  }));

  return {
    nodeId,
    mac: node.mac,
    timestamp: new Date().toISOString(),
    readings: {
      temperature: temp.rows[0] || null,
      humidity: humidity.rows[0] || null,
      luminosity: luminosity.rows[0] || null,
      gas: gasRows
    }
  };
}

async function getAverageReadings(nodeId, sensorType, startDate, endDate) {
  let table;
  
  switch(sensorType.toLowerCase()) {
    case 'temperature':
      table = 'temperature_readings';
      break;
    case 'humidity':
      table = 'humidity_readings';
      break;
    case 'luminosity':
      table = 'luminosity_readings';
      break;
    case 'gas':
      table = 'gas_readings';
      break;
    default:
      throw new Error('Tipo de sensor inválido');
  }

  let query = `SELECT AVG(value) as average, MIN(value) as min, MAX(value) as max, COUNT(*) as count FROM ${table} WHERE node_id = $1`;
  const params = [nodeId];

  if (startDate) {
    query += ` AND ts >= $${params.length + 1}`;
    params.push(new Date(startDate));
  }

  if (endDate) {
    query += ` AND ts <= $${params.length + 1}`;
    params.push(new Date(endDate));
  }

  const res = await pool.query(query, params);
  return res.rows[0];
}

async function getStatistics(nodeId, sensorType, startDate, endDate) {
  const average = await getAverageReadings(nodeId, sensorType, startDate, endDate);
  
  let table;
  switch(sensorType.toLowerCase()) {
    case 'temperature':
      table = 'temperature_readings';
      break;
    case 'humidity':
      table = 'humidity_readings';
      break;
    case 'luminosity':
      table = 'luminosity_readings';
      break;
    case 'gas':
      table = 'gas_readings';
      break;
    default:
      throw new Error('Tipo de sensor inválido');
  }

  // Cálculo de variância e desvio padrão
  let query = `SELECT 
    STDDEV(value) as stddev,
    VARIANCE(value) as variance
  FROM ${table} 
  WHERE node_id = $1`;
  
  const params = [nodeId];

  if (startDate) {
    query += ` AND ts >= $${params.length + 1}`;
    params.push(new Date(startDate));
  }

  if (endDate) {
    query += ` AND ts <= $${params.length + 1}`;
    params.push(new Date(endDate));
  }

  const res = await pool.query(query, params);
  
  return {
    ...average,
    stddev: res.rows[0]?.stddev,
    variance: res.rows[0]?.variance
  };
}

async function getNodesSummary() {
  const totals = await pool.query(`
    SELECT
      COUNT(*) AS total_nodes,
      COUNT(*) FILTER (WHERE last_seen >= now() - interval '5 minutes') AS online_nodes,
      COUNT(*) FILTER (WHERE last_seen <  now() - interval '5 minutes') AS offline_nodes
    FROM nodes
  `);

  const byLocation = await pool.query(`
    SELECT 
      description AS location,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE last_seen >= now() - interval '5 minutes') AS online,
      COUNT(*) FILTER (WHERE last_seen <  now() - interval '5 minutes') AS offline
    FROM nodes
    GROUP BY location
    ORDER BY location
  `);

  return {
    total_nodes: Number(totals.rows[0]?.total_nodes || 0),
    online_nodes: Number(totals.rows[0]?.online_nodes || 0),
    offline_nodes: Number(totals.rows[0]?.offline_nodes || 0),
    locations: byLocation.rows
  };
}

module.exports = {
  pool,
  ensureNode,
  insertTemperature,
  insertHumidity,
  insertLuminosity,
  insertGas,
  getAllNodes,
  getNodeById,
  getNodeStatus,
  getTemperatureReadings,
  getHumidityReadings,
  getLuminosityReadings,
  getGasReadings,
  getLatestReadings,
  getAverageReadings,
  getStatistics,
  getNodesSummary,
  getNodeByMac
};
