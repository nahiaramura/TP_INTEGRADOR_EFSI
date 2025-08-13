import { getEventById } from "../models/event.model.js";
import pool from "../db/index.js";

// -------------------------------
// List Events (con filtros)
// -------------------------------
const listMyEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT
        e.*,
        ec.name as category_name,
        el.name as event_location_name
      FROM events e
      LEFT JOIN event_categories ec ON ec.id = e.id_event_category
      LEFT JOIN event_locations el ON el.id = e.id_event_location
      WHERE e.id_creator_user = $1
      ORDER BY e.start_date DESC
    `, [userId]);

    const events = result.rows;

    const enriched = await Promise.all(
      events.map(async (ev) => {
        const tagsRes = await pool.query(`
          SELECT t.id, t.name
          FROM event_tags et
          JOIN tags t ON et.id_tag = t.id
          WHERE et.id_event = $1
        `, [ev.id]);

        return {
          ...ev,
          event_category: {
            id: ev.id_event_category,
            name: ev.category_name
          },
          event_location: {
            id: ev.id_event_location,
            name: ev.event_location_name
          },
          tags: tagsRes.rows
        };
      })
    );

    return res.json({ collection: enriched });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener tus eventos.",
      error: error.message
    });
  }
};

const listEvents = async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  const offset = parseInt(req.query.offset) || 0;
  const { name, startDate, tag } = req.query;

  try {
    let whereClauses = [];
    let values = [];

    if (name) {
      whereClauses.push(`LOWER(e.name) LIKE $${values.length + 1}`);
      values.push(`%${name.toLowerCase()}%`);
    }

    if (startDate) {
      whereClauses.push(`DATE(e.start_date) = $${values.length + 1}`);
      values.push(startDate);
    }

    let joinClause = '';
    if (tag) {
      const tagsArray = Array.isArray(tag) ? tag : [tag];
      joinClause = `
        JOIN event_tags et ON et.id_event = e.id
      `;
      whereClauses.push(
        `et.id_tag = ANY($${values.length + 1})`
      );
      values.push(tagsArray.map(Number));
    }

    const whereSQL =
      whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')}`
        : '';

    const query = `
      SELECT
        e.*,
        ec.name as category_name,
        el.name as event_location_name
      FROM events e
      LEFT JOIN event_categories ec ON ec.id = e.id_event_category
      LEFT JOIN event_locations el ON el.id = e.id_event_location
      ${joinClause}
      ${whereSQL}
      GROUP BY e.id, ec.name, el.name
      ORDER BY e.start_date
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);
    const events = result.rows;

    const enriched = await Promise.all(
      events.map(async (ev) => {
        const tagsRes = await pool.query(`
          SELECT t.id, t.name
          FROM event_tags et
          JOIN tags t ON et.id_tag = t.id
          WHERE et.id_event = $1
        `, [ev.id]);

        return {
          ...ev,
          event_category: {
            id: ev.id_event_category,
            name: ev.category_name
          },
          event_location: {
            id: ev.id_event_location,
            name: ev.event_location_name
          },
          tags: tagsRes.rows
        };
      })
    );

    res.json({
      collection: enriched,
      pagination: {
        limit,
        offset,
        nextPage: enriched.length < limit ? null : offset + limit,
        total: enriched.length
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// Get Event Detail
// -------------------------------

const getEventDetail = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const tagsRes = await pool.query(`
      SELECT t.id, t.name
      FROM event_tags et
      JOIN tags t ON et.id_tag = t.id
      WHERE et.id_event = $1
    `, [id]);

    res.json({
      ...event,
      tags: tagsRes.rows
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// Create Event
// -------------------------------

const createEvent = async (req, res) => {
  const {
    name,
    description,
    id_event_category,
    id_event_location,
    start_date,
    duration_in_minutes,
    price,
    enabled_for_enrollment,
    max_assistance
  } = req.body;

  try {
    if (!name || name.length < 3) {
      return res.status(400).json({ success: false, message: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
    }
    if (!description || description.length < 3) {
      return res.status(400).json({ success: false, message: "La descripción es obligatoria y debe tener al menos 3 caracteres." });
    }
    if (max_assistance < 0) {
      return res.status(400).json({ success: false, message: "max_assistance no puede ser negativo." });
    }
    if (price < 0 || duration_in_minutes < 0) {
      return res.status(400).json({ success: false, message: "El precio y la duración deben ser números positivos." });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "No autorizado. Usuario no encontrado en el token." });
    }

    const id_creator_user = req.user.id;

    const locResult = await pool.query(
      `SELECT max_capacity FROM event_locations WHERE id = $1`,
      [id_event_location]
    );

    if (locResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "La ubicación del evento no existe." });
    }

    const max_capacity = parseInt(locResult.rows[0].max_capacity, 10);
    if (max_assistance > max_capacity) {
      return res.status(400).json({
        success: false,
        message: `max_assistance (${max_assistance}) no puede superar la capacidad del lugar (${max_capacity}).`
      });
    }

    const insertResult = await pool.query(`
      INSERT INTO events (
        name, description, id_event_category, id_event_location,
        start_date, duration_in_minutes, price,
        enabled_for_enrollment, max_assistance, id_creator_user
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name,
      description,
      id_event_category,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment === undefined ? false : enabled_for_enrollment,
      max_assistance,
      id_creator_user
    ]);

    return res.status(201).json({
      success: true,
      message: "Evento creado correctamente.",
      data: insertResult.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// Update Event
// -------------------------------

const updateEvent = async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    name,
    description,
    id_event_category,
    id_event_location,
    start_date,
    duration_in_minutes,
    price,
    enabled_for_enrollment,
    max_assistance
  } = req.body;

  if (!name || name.length < 3) {
    return res.status(400).json({ success: false, message: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
  }
  if (!description || description.length < 3) {
    return res.status(400).json({ success: false, message: "La descripción es obligatoria y debe tener al menos 3 caracteres." });
  }
  if (price < 0 || duration_in_minutes < 0) {
    return res.status(400).json({ success: false, message: "El precio y la duración deben ser números positivos." });
  }

  try {
    const eventResult = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );

    if (eventResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const event = eventResult.rows[0];

    if (event.id_creator_user !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No tenés permiso para modificar este evento."
      });
    }

    const locResult = await pool.query(
      `SELECT max_capacity FROM event_locations WHERE id = $1`,
      [id_event_location]
    );

    if (locResult.rowCount === 0) {
      return res.status(400).json({ success: false, message: "La ubicación del evento no existe." });
    }

    const max_capacity = parseInt(locResult.rows[0].max_capacity, 10);
    if (max_assistance > max_capacity) {
      return res.status(400).json({
        success: false,
        message: `max_assistance (${max_assistance}) no puede superar la capacidad del lugar (${max_capacity}).`
      });
    }

    await pool.query(`
      UPDATE events
      SET
        name = $1,
        description = $2,
        id_event_category = $3,
        id_event_location = $4,
        start_date = $5,
        duration_in_minutes = $6,
        price = $7,
        enabled_for_enrollment = $8,
        max_assistance = $9
      WHERE id = $10
    `, [
      name,
      description,
      id_event_category,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment === undefined ? false : enabled_for_enrollment,
      max_assistance,
      id
    ]);

    return res.status(200).json({
      success: true,
      message: "Evento actualizado correctamente."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// Delete Event
// -------------------------------

const deleteEvent = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  console.log("REQ.USER:", req.user);

  try {
    const eventRes = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "El evento no existe."
      });
    }

    const event = eventRes.rows[0];

    if (event.id_creator_user !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tenés permiso para eliminar este evento."
      });
    }

    const enrollments = await pool.query(
      `SELECT * FROM event_enrollments WHERE id_event = $1`,
      [id]
    );

    if (enrollments.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el evento porque tiene usuarios registrados."
      });
    }

    await pool.query(
      `DELETE FROM events WHERE id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Evento eliminado correctamente."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -------------------------------
// Enroll User to Event
// -------------------------------

const enrollUser = async (req, res) => {
  const id_event = parseInt(req.params.id);
  const id_user = req.user.id;
  const { description, attended, observations, rating } = req.body;

  try {
    if (!id_event || !id_user) {
      return res.status(400).json({ success: false, message: "id_event y id_user son obligatorios." });
    }

    await pool.query(`
      INSERT INTO event_enrollments (id_event, id_user, description, attended, observations, rating)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id_event, id_user, description || null, attended || false, observations || null, rating || null]);

    res.status(201).json({
      success: true,
      message: "Usuario inscripto correctamente al evento."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// Delete Enrollment
// -------------------------------

const deleteEnrollment = async (req, res) => {
  try {
    const id_event = parseInt(req.params.id);
    const id_user = req.user.id;

    if (!id_event) {
      return res.status(400).json({
        success: false,
        message: 'Id de evento inválido.'
      });
    }

    const event = await pool.query(`SELECT * FROM events WHERE id = $1`, [id_event]);
    if (event.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El evento no existe.'
      });
    }

    const now = new Date();
    const eventDate = new Date(event.rows[0].start_date);
    if (eventDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la inscripción de un evento pasado o que es hoy.'
      });
    }

    const enrollment = await pool.query(
      `SELECT * FROM event_enrollments WHERE id_event = $1 AND id_user = $2`,
      [id_event, id_user]
    );

    if (enrollment.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no está registrado en el evento.'
      });
    }

    await pool.query(
      `DELETE FROM event_enrollments WHERE id_event = $1 AND id_user = $2`,
      [id_event, id_user]
    );

    return res.status(200).json({
      success: true,
      message: 'Te desinscribiste correctamente del evento.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -------------------------------
// List event locations
// -------------------------------


const listEventLocations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10);
    const offset = parseInt(req.query.offset, 10);
    
    const safeLimit = Number.isInteger(limit) ? limit : 10;
    const safeOffset = Number.isInteger(offset) ? offset : 0;
       

      const result = await pool.query(
          `SELECT * FROM event_locations WHERE id_creator_user = $1 LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
      );

      return res.status(200).json({
          collection: result.rows
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: 'Error al obtener las ubicaciones de eventos.',
          error: error.message
      });
  }
};
export const getEnrollmentStatus = async (req, res) => {
  const id_event = req.params.id;
  const id_user = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM event_enrollments WHERE id_event = $1 AND id_user = $2",
      [id_event, id_user]
    );

    return res.json({ enrolled: result.rowCount > 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error verificando inscripción" });
  }
};

export {
  listEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollUser,
  deleteEnrollment,
  listEventLocations,
  listMyEvents // 👈 AGREGALO ACÁ
};

