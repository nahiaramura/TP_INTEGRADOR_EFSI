// routes/eventLocation.routes.js
import express from 'express';
import pool from '../db/index.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Crear ubicación
router.post('/', verifyToken, async (req, res) => {
  const { name, full_address, latitude, longitude, id_location, max_capacity } = req.body;
  const id_creator_user = req.user?.id || req.userId;

  if (!name || name.trim().length < 3 || !full_address || full_address.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre o la dirección son inválidos (mínimo 3 caracteres).' });
  }
  if (!id_location || Number.isNaN(Number(id_location))) {
    return res.status(400).json({ error: 'El id_location es inválido o inexistente.' });
  }
  if (!max_capacity || Number(max_capacity) <= 0) {
    return res.status(400).json({ error: 'La capacidad máxima debe ser mayor a cero.' });
  }

  try {
    const locationCheck = await pool.query(
      'SELECT id FROM locations WHERE id = $1',
      [Number(id_location)]
    );
    if (locationCheck.rowCount === 0) {
      return res.status(400).json({ error: 'El id_location no existe.' });
    }

    const insert = await pool.query(
      `INSERT INTO event_locations
         (name, full_address, latitude, longitude, id_location, max_capacity, id_creator_user)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, full_address, latitude, longitude, id_location, max_capacity, id_creator_user`,
      [
        name.trim(),
        full_address.trim(),
        (latitude === '' || latitude == null) ? null : Number(latitude),
        (longitude === '' || longitude == null) ? null : Number(longitude),
        Number(id_location),
        Number(max_capacity),
        id_creator_user
      ]
    );

    return res.status(201).json({ success: true, data: insert.rows[0] });
  } catch (err) {
    console.error('Error al crear event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al crear la ubicación.' });
  }
});

// Obtener 1 ubicación del usuario
router.get('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const id_creator_user = req.user?.id || req.userId;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM event_locations WHERE id = $1 AND id_creator_user = $2`,
      [id, id_creator_user]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'La ubicación no existe o no pertenece al usuario autenticado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al obtener la ubicación.' });
  }
});

// Actualizar ubicación
router.put('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const id_creator_user = req.user?.id || req.userId;
  const { name, full_address, latitude, longitude, id_location, max_capacity } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }
  if (!name || name.trim().length < 3 || !full_address || full_address.trim().length < 3) {
    return res.status(400).json({ error: 'Nombre o dirección inválidos.' });
  }
  if (!id_location || Number.isNaN(Number(id_location))) {
    return res.status(400).json({ error: 'ID de localidad inválido.' });
  }
  if (!max_capacity || Number(max_capacity) <= 0) {
    return res.status(400).json({ error: 'La capacidad máxima debe ser mayor a cero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE event_locations
         SET name = $1,
             full_address = $2,
             latitude = $3,
             longitude = $4,
             id_location = $5,
             max_capacity = $6
       WHERE id = $7 AND id_creator_user = $8
       RETURNING id, name, full_address, latitude, longitude, id_location, max_capacity, id_creator_user`,
      [
        name.trim(),
        full_address.trim(),
        (latitude === '' || latitude == null) ? null : Number(latitude),
        (longitude === '' || longitude == null) ? null : Number(longitude),
        Number(id_location),
        Number(max_capacity),
        id,
        id_creator_user
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ubicación no encontrada o no te pertenece.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al actualizar la ubicación.' });
  }
});

// Listar MIS ubicaciones  ✅ ahora protegido y con {collection: ...}
router.get('/', verifyToken, async (req, res) => {
  const id_creator_user = req.user?.id || req.userId;

  try {
    const result = await pool.query(
      `SELECT id, name, max_capacity, id_location, full_address, latitude, longitude
         FROM event_locations
        WHERE id_creator_user = $1
        ORDER BY id DESC`,
      [id_creator_user]
    );

    return res.status(200).json({ collection: result.rows }); // 👈 el front espera "collection"
  } catch (err) {
    console.error('Error al obtener las ubicaciones del usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor al listar ubicaciones.' });
  }
});

// Eliminar ubicación
router.delete('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const id_creator_user = req.user?.id || req.userId;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM event_locations WHERE id = $1 AND id_creator_user = $2 RETURNING id`,
      [id, id_creator_user]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'La ubicación no existe o no te pertenece.' });
    }

    return res.status(200).json({ message: 'Ubicación eliminada correctamente.' });
  } catch (err) {
    console.error('Error al eliminar event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar la ubicación.' });
  }
});

export default router;
