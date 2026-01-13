const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/readings/temperature - leituras de temperatura
router.get("/temperature", async (req, res) => {
  try {
    const { nodeId, limit = 100, offset = 0 } = req.query;
    const readings = await db.getTemperatureReadings(nodeId, limit, offset);
    res.json(readings);
  } catch (error) {
    console.error("Erro ao buscar leituras de temperatura:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

// GET /api/readings/humidity - leituras de umidade
router.get("/humidity", async (req, res) => {
  try {
    const { nodeId, limit = 100, offset = 0 } = req.query;
    const readings = await db.getHumidityReadings(nodeId, limit, offset);
    res.json(readings);
  } catch (error) {
    console.error("Erro ao buscar leituras de umidade:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

// GET /api/readings/luminosity - leituras de luminosidade
router.get("/luminosity", async (req, res) => {
  try {
    const { nodeId, limit = 100, offset = 0 } = req.query;
    const readings = await db.getLuminosityReadings(nodeId, limit, offset);
    res.json(readings);
  } catch (error) {
    console.error("Erro ao buscar leituras de luminosidade:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

// GET /api/readings/gas - leituras de gás
router.get("/gas", async (req, res) => {
  try {
    const { nodeId, gasType, limit = 100, offset = 0 } = req.query;
    const readings = await db.getGasReadings(nodeId, gasType, limit, offset);
    res.json(readings);
  } catch (error) {
    console.error("Erro ao buscar leituras de gás:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

// GET /api/readings/:nodeId/latest - última leitura de todos os sensores
router.get("/:nodeId/latest", async (req, res) => {
  try {
    const idParam = req.params.nodeId;
    let nodeId = idParam;
    // Aceitar MAC (ex: AA:BB:CC:DD:EE:FF) além de ID numérico
    if (!/^\d+$/.test(idParam)) {
      const node = await db.getNodeByMac(idParam);
      if (!node) {
        return res.status(404).json({ error: "Nó não encontrado" });
      }
      nodeId = node.id;
    }

    const latest = await db.getLatestReadings(nodeId);
    if (!latest) {
      return res.status(404).json({ error: "Nó não encontrado" });
    }
    res.json(latest);
  } catch (error) {
    console.error("Erro ao buscar últimas leituras:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

module.exports = router;
