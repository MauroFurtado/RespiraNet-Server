const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/analytics/average - média de leituras em um período
router.get("/average", async (req, res) => {
  try {
    const { nodeId, sensorType, startDate, endDate } = req.query;
    
    if (!nodeId || !sensorType) {
      return res.status(400).json({ 
        error: "nodeId e sensorType são obrigatórios" 
      });
    }

    const average = await db.getAverageReadings(
      nodeId, 
      sensorType, 
      startDate, 
      endDate
    );
    res.json(average);
  } catch (error) {
    console.error("Erro ao calcular média:", error);
    res.status(500).json({ error: "Erro ao calcular média" });
  }
});

// GET /api/analytics/statistics - estatísticas de um sensor
router.get("/statistics", async (req, res) => {
  try {
    const { nodeId, sensorType, startDate, endDate } = req.query;
    
    if (!nodeId || !sensorType) {
      return res.status(400).json({ 
        error: "nodeId e sensorType são obrigatórios" 
      });
    }

    const stats = await db.getStatistics(
      nodeId, 
      sensorType, 
      startDate, 
      endDate
    );
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

module.exports = router;
