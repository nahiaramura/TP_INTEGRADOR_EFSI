import pool from '../db/index.js';

export const getAllTags = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM tags ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
