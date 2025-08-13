// En eventCategory.routes.js
import express from "express";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM event_categories ORDER BY display_order");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

export default router;
