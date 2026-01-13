const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

module.exports = {
  pg: {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
  },
  mqtt: {
    url: process.env.MQTT_URL ,
    topic: process.env.MQTT_TOPIC
  },
  server: {
    port: parseInt(process.env.PORT)
  }
};
