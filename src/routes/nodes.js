const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/nodes - lista todos os nós registrados
router.get("/", async (req, res) => {
  try {
    const nodes = await db.getAllNodes();
    res.json(nodes);
  } catch (error) {
    console.error("Erro ao buscar nós:", error);
    res.status(500).json({ error: "Erro ao buscar nós" });
  }
});

// GET /api/nodes/status/summary - resumo de status por localização
router.get("/status/summary", async (req, res) => {
  try {
    const summary = await db.getNodesSummary();
    res.json(summary);
  } catch (error) {
    console.error("Erro ao buscar resumo de status:", error);
    res.status(500).json({ error: "Erro ao buscar resumo de status" });
  }
});

// GET /api/nodes/:id - detalhes de um nó específico
router.get("/:id", async (req, res) => {
  try {
    const node = await db.getNodeById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: "Nó não encontrado" });
    }
    res.json(node);
  } catch (error) {
    console.error("Erro ao buscar nó:", error);
    res.status(500).json({ error: "Erro ao buscar nó" });
  }
});

// GET /api/nodes/:id/status - status atual do nó
router.get("/:id/status", async (req, res) => {
  try {
    const status = await db.getNodeStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: "Nó não encontrado" });
    }
    res.json(status);
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

module.exports = router;
