const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

module.exports = {
  pg: {
    host: process.env.PGHOST || "db",
    port: parseInt(process.env.PGPORT || "5432", 10),
    database: process.env.PGDATABASE || "respiranet",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres"
  },
  mqtt: {
    url: process.env.MQTT_URL || "mqtt://mqtt:1883",
    topic: process.env.MQTT_TOPIC || "env/master/+/+"
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10)
  }
};
