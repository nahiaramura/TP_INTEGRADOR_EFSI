// routes/location.routes.js
import express from "express";
import pool from "../db/index.js";

const router = express.Router();

// GET /api/locations — devuelve todas las localidades con su provincia
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id,
        l.name AS location_name,
        p.name AS province_name
      FROM locations l
      JOIN provinces p ON l.id_province = p.id
      ORDER BY p.name, l.name
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener localidades:", err);
    res.status(500).json({ error: "Error al obtener localidades" });
  }
});

export default router;
