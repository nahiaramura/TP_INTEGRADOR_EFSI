import pool from "../db/index.js";

export const listEventLocations = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const limit  = Number.parseInt(req.query.limit, 10)  || 20;
    const offset = Number.parseInt(req.query.offset, 10) || 0;

    console.log("[listEventLocations] userId:", userId, "limit:", limit, "offset:", offset);

    const { rows } = await pool.query(
      `SELECT id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user
         FROM event_locations
        WHERE id_creator_user = $1
        ORDER BY id DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    console.log("[listEventLocations] rows:", rows.length);
    return res.status(200).json({ collection: rows });
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    return res.status(500).json({ message: "Error al obtener ubicaciones", error: error.message });
  }
};
export const createEventLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const {
      name,
      full_address,
      max_capacity,
      latitude,
      longitude,
      id_location,
    } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Nombre inválido (mínimo 3 caracteres)." });
    }
    if (!id_location || Number.isNaN(Number(id_location))) {
      return res.status(400).json({ message: "Seleccione una localidad válida (id_location)." });
    }
    if (!max_capacity || Number(max_capacity) <= 0) {
      return res.status(400).json({ message: "Capacidad máxima debe ser > 0." });
    }

    const loc = await pool.query("SELECT id FROM locations WHERE id = $1", [Number(id_location)]);
    if (loc.rowCount === 0) return res.status(400).json({ message: "La localidad no existe." });

    const { rows } = await pool.query(
      `INSERT INTO event_locations
         (id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user`,
      [
        Number(id_location),
        name.trim(),
        (full_address ?? "").trim() || null,
        Number(max_capacity),
        latitude === "" || latitude === null || latitude === undefined ? null : Number(latitude),
        longitude === "" || longitude === null || longitude === undefined ? null : Number(longitude),
        userId,
      ]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error al crear ubicación:", error);
    if (error.code === "23503") {
      return res.status(400).json({ message: "FK inválida (id_location o usuario)." });
    }
    return res.status(500).json({ message: "Error al crear ubicación", error: error.message });
  }
};

export const updateEventLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const { id } = req.params;
    const {
      name,
      full_address,
      max_capacity,
      latitude,
      longitude,
      id_location,
    } = req.body;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ message: "ID inválido." });
    }
    if (name !== undefined && name.trim().length < 3) {
      return res.status(400).json({ message: "Nombre inválido (mínimo 3 caracteres)." });
    }
    if (max_capacity !== undefined && Number(max_capacity) <= 0) {
      return res.status(400).json({ message: "Capacidad máxima debe ser > 0." });
    }
    if (id_location !== undefined && Number.isNaN(Number(id_location))) {
      return res.status(400).json({ message: "Seleccione una localidad válida (id_location)." });
    }

    if (id_location !== undefined) {
      const loc = await pool.query("SELECT id FROM locations WHERE id = $1", [Number(id_location)]);
      if (loc.rowCount === 0) return res.status(400).json({ message: "La localidad no existe." });
    }

    const { rows } = await pool.query(
      `UPDATE event_locations
          SET
            id_location   = COALESCE($1, id_location),
            name          = COALESCE($2, name),
            full_address  = COALESCE($3, full_address),
            max_capacity  = COALESCE($4, max_capacity),
            latitude      = COALESCE($5, latitude),
            longitude     = COALESCE($6, longitude)
        WHERE id = $7 AND id_creator_user = $8
        RETURNING id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user`,
      [
        id_location !== undefined ? Number(id_location) : null,
        name !== undefined ? name.trim() : null,
        full_address !== undefined ? ((full_address ?? "").trim() || null) : null,
        max_capacity !== undefined ? Number(max_capacity) : null,
        latitude !== undefined ? (latitude === "" || latitude === null ? null : Number(latitude)) : null,
        longitude !== undefined ? (longitude === "" || longitude === null ? null : Number(longitude)) : null,
        Number(id),
        userId,
      ]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Ubicación no encontrada." });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error al actualizar ubicación:", error);
    if (error.code === "23503") {
      return res.status(400).json({ message: "FK inválida (id_location)." });
    }
    return res.status(500).json({ message: "Error al actualizar ubicación", error: error.message });
  }
};

export const deleteEventLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const result = await pool.query(
      "DELETE FROM event_locations WHERE id = $1 AND id_creator_user = $2 RETURNING id",
      [Number(id), userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ubicación no encontrada." });
    }

    return res.status(200).json({ success: true, message: "Ubicación eliminada." });
  } catch (error) {
    console.error("Error al eliminar ubicación:", error);
    if (error.code === "23503") {
      return res.status(400).json({ message: "No se puede eliminar: la ubicación está en uso por eventos." });
    }
    return res.status(500).json({ message: "Error al eliminar ubicación", error: error.message });
  }
};

export const listAllLocationsWithProvince = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        l.id,
        l.name AS location_name,
        p.name AS province_name
      FROM locations l
      JOIN provinces p ON l.id_province = p.id
      ORDER BY p.name, l.name
    `);

    return res.status(200).json({ collection: rows });
  } catch (error) {
    console.error("Error al obtener localidades con provincia:", error);
    return res.status(500).json({ message: "Error al obtener localidades", error: error.message });
  }
};