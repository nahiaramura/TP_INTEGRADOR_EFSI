import pool from "../db/index.js";

export const createUser = async (first_name, last_name, username, password) => {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, username, password)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [first_name, last_name, username, password]
  );
  return result.rows[0];
};

export const findUserByCredentials = async (username, password) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1 AND password = $2`,
    [username, password]
  );
  return result.rows[0];
};
