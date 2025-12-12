const express = require("express");
const mqtt = require("mqtt");
const config = require("./config");
const db = require("./db");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

const mqttClient = mqtt.connect(config.mqtt.url, { reconnectPeriod: 5000 });// reconectar a cada 5s se desconectar

mqttClient.on("connect", () => {
  console.log("[MQTT] conectado a", config.mqtt.url);
  const topics = (config.mqtt.topic || "env/master/+/+").split(",").map(t => t.trim());
  topics.forEach(t => {
    mqttClient.subscribe(t, { qos: 0 }, (err) => {
      if (err) console.error("[MQTT] subscribe erro", err);
      else console.log("[MQTT] subscrito em", t);
    });//
  });
});
// tratar erros de conexão MQTT
mqttClient.on("error", (err) => {
  console.error("[MQTT] erro", err.message || err);
});

function parseTimestamp(tsStr) {
  if (!tsStr) return new Date();
  const d = new Date(tsStr);
  return isNaN(d.getTime()) ? new Date() : d;
}
// tenta inferir o tipo de sensor a partir do tópico MQTT
function sensorTypeFromTopic(topic) {
  const parts = topic.split("/");
  const last = parts[parts.length - 1].toLowerCase();
  if (last.includes("temp") || last.includes("temper")) return "temperature";
  if (last.includes("umi") || last.includes("humidity")) return "humidity";
  if (last.includes("ldr") || last.includes("lum")) return "luminosity";
  if (last.includes("mq2") || last.includes("mq135") || last.includes("gas")) return last;
  return null;
}
// tratar mensagens recebidas via MQTT
mqttClient.on("message", async (topic, messageBuffer) => {
  let payloadStr = messageBuffer.toString();
  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch (e) {
    console.warn("[MQTT] payload não é JSON:", payloadStr);
    return;
  }
// extrair o MAC do nó sensor
  const mac = payload.nodeMac || payload.mac || payload.device || null;
  if (!mac) {
    console.warn("[MQTT] mensagem sem nodeMac:", payload);
    return;
  }
// determinar o tipo de sensor e valor
  const sensorTypeTopic = sensorTypeFromTopic(topic);
  const value = (typeof payload.value === "number") ? payload.value : parseFloat(payload.value);
  const ts = parseTimestamp(payload.timestamp || payload.ts || null);
  
  try {
    const nodeId = await db.ensureNode(mac);
    const raw = payload;

    if (sensorTypeTopic === "temperature" || payload.type === "temperatura" || payload.type === "temperature") {
      await db.insertTemperature(nodeId, value, ts, raw);
      console.log(`[DB] temp ${value} (node ${mac})`);
    } else if (sensorTypeTopic === "humidity" || payload.type === "umidade" || payload.type === "humidity") {
      await db.insertHumidity(nodeId, value, ts, raw);
      console.log(`[DB] humidity ${value} (node ${mac})`);
    } else if (sensorTypeTopic === "luminosity" || payload.type === "ldr" || payload.type === "luminosity") {
      await db.insertLuminosity(nodeId, value, ts, raw);
      console.log(`[DB] luminosity ${value} (node ${mac})`);
    } else {
      const sensorName = sensorTypeTopic || (payload.type || "").toLowerCase() || "unknown";
      await db.insertGas(nodeId, value, ts, raw);
      console.log(`[DB] gas(${sensorName}) ${value} (node ${mac})`);
    }
  } catch (err) {
    console.error("[ERR] ao gravar no banco:", err.message || err);
  }
});

const server = app.listen(config.server.port, () => {
  console.log(`HTTP server listening on port ${config.server.port}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  mqttClient.end(true);
  await db.pool.end();
  server.close(() => process.exit(0));
});

async function insertGas(nodeId, value, ts, raw) {
  await pool.query(
    `INSERT INTO gas_readings (node_id, value, ts, raw) VALUES ($1, $2, $3, $4)`,
    [nodeId, value, ts, raw]
  );
}
