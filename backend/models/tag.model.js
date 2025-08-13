import pool from "../db/index.js";

export const getAllTags = async () => {
  const result = await pool.query("SELECT id, name FROM tags ORDER BY name ASC");
  return result.rows;
};
