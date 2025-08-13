import pool from "../db/index.js";

export const getAllEvents = async (limit, offset) => {
  const result = await pool.query(`
    SELECT e.*, ec.name as category_name, el.name as event_location_name
    FROM events e
    LEFT JOIN event_categories ec ON e.id_event_category = ec.id
    LEFT JOIN event_locations el ON e.id_event_location = el.id
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  return result.rows;
};

export const getEventById = async (id) => {
  const result = await pool.query(`
    SELECT * FROM events WHERE id = $1
  `, [id]);

  return result.rows[0];
};
