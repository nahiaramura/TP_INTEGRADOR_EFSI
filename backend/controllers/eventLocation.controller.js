// controllers/eventLocation.controller.js
import pool from '../db/index.js';

export const listEventLocations = async (req, res) => {
    const userId = req.userId;
    try {
      const [rows] = await pool.query(
        'SELECT id, name, max_capacity FROM event_locations WHERE id_creator_user = ?',
        [userId]
      );
      res.status(200).json({ collection: rows }); // 👈 Asegurate de devolver así
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      res.status(500).json({ message: 'Error al obtener ubicaciones' });
    }
  };
  

export const createEventLocation = async (req, res) => {
  const userId = req.userId;
  const { name, full_address, max_capacity, latitude, longitude } = req.body;

  if (!name || !max_capacity) {
    return res.status(400).json({ message: 'Faltan campos requeridos (name, max_capacity)' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO event_locations (name, full_address, max_capacity, latitude, longitude, id_creator_user) VALUES (?, ?, ?, ?, ?, ?)',
      [name, full_address, max_capacity, latitude, longitude, userId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    res.status(500).json({ message: 'Error al crear ubicación' });
  }
};

export const updateEventLocation = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, full_address, max_capacity, latitude, longitude } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE event_locations SET name = ?, full_address = ?, max_capacity = ?, latitude = ?, longitude = ? WHERE id = ? AND id_creator_user = ?',
      [name, full_address, max_capacity, latitude, longitude, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }

    res.status(200).json({ message: 'Ubicación actualizada' });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ message: 'Error al actualizar ubicación' });
  }
};

export const deleteEventLocation = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM event_locations WHERE id = ? AND id_creator_user = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }

    res.status(200).json({ message: 'Ubicación eliminada' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    res.status(500).json({ message: 'Error al eliminar ubicación' });
  }
};
// controllers/eventLocation.controller.js (al final del archivo)
export const listAllLocationsWithProvince = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.name AS location_name,
        p.name AS province_name
      FROM locations l
      JOIN provinces p ON l.id_province = p.id
      ORDER BY p.name, l.name
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener localidades con provincia:", error);
    res.status(500).json({ message: "Error al obtener localidades" });
  }
};
