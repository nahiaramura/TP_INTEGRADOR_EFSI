import pool from "../db/index.js";
const listMyEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT
        e.*,
        ec.name AS category_name,
        el.name AS event_location_name
      FROM events e
      LEFT JOIN event_categories ec ON ec.id = e.id_event_category
      LEFT JOIN event_locations  el ON el.id = e.id_event_location
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
          ORDER BY t.name
        `, [ev.id]);

        return {
          ...ev,
          event_category: { id: ev.id_event_category, name: ev.category_name },
          event_location: { id: ev.id_event_location, name: ev.event_location_name },
          tags: tagsRes.rows
        };
      })
    );

    return res.json({ collection: enriched });
  } catch (error) {
    console.error("listMyEvents error:", error);
    return res.status(500).json({ success: false, message: "Error al obtener tus eventos.", error: error.message });
  }
};

const listEvents = async (req, res) => {
  const limit  = parseInt(req.query.limit, 10)  || 15;
  const offset = parseInt(req.query.offset, 10) || 0;
  const { name, startDate, tag, upcoming } = req.query;

  try {
    let whereClauses = [];
    let values = [];
    let joins = `
      LEFT JOIN event_categories ec ON ec.id = e.id_event_category
      LEFT JOIN event_locations  el ON el.id = e.id_event_location
    `;

    if (name) {
      whereClauses.push(`LOWER(e.name) LIKE $${values.length + 1}`);
      values.push(`%${name.toLowerCase()}%`);
    }
    if (startDate) {
      whereClauses.push(`DATE(e.start_date) = $${values.length + 1}`);
      values.push(startDate);
    }
    if (upcoming) {
      whereClauses.push(`e.start_date >= NOW()`);
    }
    if (tag) {
      const tagsArray = Array.isArray(tag) ? tag : [tag];
      joins += ` JOIN event_tags et ON et.id_event = e.id `;
      whereClauses.push(`et.id_tag = ANY($${values.length + 1})`);
      values.push(tagsArray.map(Number));
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT
        e.*,
        ec.name AS category_name,
        el.name AS event_location_name
      FROM events e
      ${joins}
      ${whereSQL}
      GROUP BY e.id, ec.name, el.name
      ORDER BY e.start_date
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    const enriched = await Promise.all(
      result.rows.map(async (ev) => {
        const tagsRes = await pool.query(`
          SELECT t.id, t.name
          FROM event_tags et
          JOIN tags t ON et.id_tag = t.id
          WHERE et.id_event = $1
          ORDER BY t.name
        `, [ev.id]);

        return {
          ...ev,
          event_category: { id: ev.id_event_category, name: ev.category_name },
          event_location: { id: ev.id_event_location, name: ev.event_location_name },
          tags: tagsRes.rows
        };
      })
    );

    return res.json({
      collection: enriched,
      pagination: {
        limit,
        offset,
        nextPage: enriched.length < limit ? null : offset + limit,
        total: enriched.length
      }
    });
  } catch (error) {
    console.error("listEvents error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getEventDetail = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const evQ = await pool.query(`
      SELECT
        e.*,
        ec.name                         AS category_name,
        el.name                         AS location_name,
        el.full_address                 AS full_address,
        l.name                          AS locality,
        p.name                          AS province,
        (u.first_name || ' ' || u.last_name) AS creator_name
      FROM events e
      LEFT JOIN event_categories ec ON ec.id = e.id_event_category
      LEFT JOIN event_locations  el ON el.id = e.id_event_location
      LEFT JOIN locations        l  ON l.id = el.id_location
      LEFT JOIN provinces        p  ON p.id = l.id_province
      LEFT JOIN users            u  ON u.id = e.id_creator_user
      WHERE e.id = $1
      LIMIT 1
    `, [id]);

    if (evQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const base = evQ.rows[0];

    const tagsRes = await pool.query(`
      SELECT t.id, t.name
      FROM event_tags et
      JOIN tags t ON et.id_tag = t.id
      WHERE et.id_event = $1
      ORDER BY t.name
    `, [id]);

    const enrollRes = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        ee.registration_date_time,
        ee.attended,
        ee.rating
      FROM event_enrollments ee
      JOIN users u ON u.id = ee.id_user
      WHERE ee.id_event = $1
      ORDER BY ee.registration_date_time ASC
    `, [id]);

    return res.json({
      ...base,
      tags: tagsRes.rows,
      enrollments: enrollRes.rows,
      enrolled_count: enrollRes.rowCount
    });
  } catch (error) {
    console.error("getEventDetail error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  const id = Number(req.params.id);
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

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ success: false, message: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
  }
  if (!description || description.trim().length < 3) {
    return res.status(400).json({ success: false, message: "La descripción es obligatoria y debe tener al menos 3 caracteres." });
  }
  if (price < 0 || duration_in_minutes < 0) {
    return res.status(400).json({ success: false, message: "El precio y la duración deben ser números positivos." });
  }

  try {
    const eventResult = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    if (eventResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const event = eventResult.rows[0];
    if (event.id_creator_user !== req.user.id) {
      return res.status(403).json({ success: false, message: "No tenés permiso para modificar este evento." });
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
      name.trim(),
      description.trim(),
      Number(id_event_category),
      Number(id_event_location),
      start_date,
      Number(duration_in_minutes),
      Number(price),
      enabled_for_enrollment ?? false,
      Number(max_assistance),
      id
    ]);

    return res.status(200).json({ success: true, message: "Evento actualizado correctamente." });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;

  try {
    const eventRes = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    if (eventRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const event = eventRes.rows[0];
    if (event.id_creator_user !== userId) {
      return res.status(403).json({ success: false, message: "No tenés permiso para eliminar este evento." });
    }

    const enrollments = await pool.query(`SELECT 1 FROM event_enrollments WHERE id_event = $1 LIMIT 1`, [id]);
    if (enrollments.rowCount > 0) {
      return res.status(400).json({ success: false, message: "No se puede eliminar el evento porque tiene usuarios registrados." });
    }

    await pool.query(`DELETE FROM events WHERE id = $1`, [id]);
    return res.status(200).json({ success: true, message: "Evento eliminado correctamente." });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const enrollUser = async (req, res) => {
  const id_event = Number(req.params.id);
  const id_user  = req.user.id;
  const { description, attended, observations, rating } = req.body;

  try {
    if (!id_event || !id_user) {
      return res.status(400).json({ success: false, message: "id_event y id_user son obligatorios." });
    }

    await pool.query(`
      INSERT INTO event_enrollments (id_event, id_user, description, attended, observations, rating)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [id_event, id_user, description || null, attended || false, observations || null, rating || null]);

    return res.status(201).json({ success: true, message: "Usuario inscripto correctamente al evento." });
  } catch (error) {
    console.error("enrollUser error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const id_event = Number(req.params.id);
    const id_user  = req.user.id;

    if (!id_event) {
      return res.status(400).json({ success: false, message: "Id de evento inválido." });
    }

    const event = await pool.query(`SELECT start_date FROM events WHERE id = $1`, [id_event]);
    if (event.rowCount === 0) {
      return res.status(404).json({ success: false, message: "El evento no existe." });
    }

    const now = new Date();
    const eventDate = new Date(event.rows[0].start_date);
    // Permitir cancelar el mismo día del evento, pero no si ya pasó
    // Bloqueamos solo si la fecha del evento es estrictamente anterior al inicio del día actual
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (eventDate < startOfToday) {
      return res.status(400).json({ success: false, message: "No se puede eliminar la inscripción de un evento pasado." });
    }

    const enrollment = await pool.query(
      `SELECT 1 FROM event_enrollments WHERE id_event = $1 AND id_user = $2 LIMIT 1`,
      [id_event, id_user]
    );
    if (enrollment.rowCount === 0) {
      return res.status(400).json({ success: false, message: "El usuario no está registrado en el evento." });
    }

    await pool.query(`DELETE FROM event_enrollments WHERE id_event = $1 AND id_user = $2`, [id_event, id_user]);
    return res.status(200).json({ success: true, message: "Te desinscribiste correctamente del evento." });
  } catch (error) {
    console.error("deleteEnrollment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listEventLocations = async (req, res) => {
  try {
    const userId    = req.user.id;                  
    const limitQ    = parseInt(req.query.limit, 10);
    const offsetQ   = parseInt(req.query.offset, 10);
    const safeLimit = Number.isInteger(limitQ)  ? limitQ  : 10;
    const safeOff   = Number.isInteger(offsetQ) ? offsetQ : 0;

    const result = await pool.query(
      `SELECT id, name, max_capacity, id_location, full_address, latitude, longitude
         FROM event_locations
        WHERE id_creator_user = $1
        ORDER BY id DESC
        LIMIT $2 OFFSET $3`,
      [userId, safeLimit, safeOff]
    );

    return res.status(200).json({ collection: result.rows });
  } catch (error) {
    console.error("listEventLocations error:", error);
    return res.status(500).json({ message: "Error al obtener las ubicaciones de eventos.", error: error.message });
  }
};

const getEnrollmentStatus = async (req, res) => {
  const id_event = Number(req.params.id);
  const id_user  = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 1 FROM event_enrollments WHERE id_event = $1 AND id_user = $2 LIMIT 1`,
      [id_event, id_user]
    );
    return res.json({ enrolled: result.rowCount > 0 });
  } catch (err) {
    console.error("getEnrollmentStatus error:", err);
    return res.status(500).json({ message: "Error verificando inscripción" });
  }
};

const safeInt = (v, def = 0) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};
const safeNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const normalizeTs = (s) => {
  if (!s) return null;
  let str = String(s).replace("T", " ").trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(str)) str += ":00";
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(str)) return str;
  return null; 
};

const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      id_event_category,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance,
    } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, message: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
    }
    if (!description || description.trim().length < 3) {
      return res.status(400).json({ success: false, message: "La descripción es obligatoria y debe tener al menos 3 caracteres." });
    }
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "No autorizado. Usuario no encontrado en el token." });
    }

    const catId      = safeInt(id_event_category, -1);
    const locId      = safeInt(id_event_location, -1);
    const duration   = safeInt(duration_in_minutes, 0);
    const priceNum   = safeNum(price, 0);
    const maxAssist  = safeInt(max_assistance, 0);
    const startLocal = normalizeTs(start_date);

    if (catId <= 0) return res.status(400).json({ success: false, message: "Categoría inválida." });
    if (locId <= 0) return res.status(400).json({ success: false, message: "Ubicación inválida." });
    if (duration < 0 || priceNum < 0) {
      return res.status(400).json({ success: false, message: "El precio y la duración deben ser números positivos." });
    }
    if (maxAssist < 0) {
      return res.status(400).json({ success: false, message: "max_assistance no puede ser negativo." });
    }
    if (!startLocal) {
      return res.status(400).json({ success: false, message: "Fecha/hora inválida. Formato esperado: YYYY-MM-DD HH:MM[:SS]" });
    }

    const id_creator_user = req.user.id;

    const locResult = await pool.query(
      `SELECT max_capacity FROM event_locations WHERE id = $1`,
      [locId]
    );
    if (locResult.rowCount === 0) {
      return res.status(400).json({ success: false, message: "La ubicación del evento no existe." });
    }
    const max_capacity = safeInt(locResult.rows[0].max_capacity, 0);
    if (maxAssist > max_capacity) {
      return res.status(400).json({
        success: false,
        message: `max_assistance (${maxAssist}) no puede superar la capacidad del lugar (${max_capacity}).`,
      });
    }

    const insert = await pool.query(
      `
      INSERT INTO events (
        name, description, id_event_category, id_event_location,
        start_date, duration_in_minutes, price,
        enabled_for_enrollment, max_assistance, id_creator_user
      )
      VALUES ($1,$2,$3,$4, to_timestamp($5, 'YYYY-MM-DD HH24:MI:SS')::timestamp, $6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        name.trim(),
        description.trim(),
        catId,
        locId,
        startLocal,                
        duration,
        priceNum,
        !!enabled_for_enrollment,
        maxAssist,
        id_creator_user,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Evento creado correctamente.",
      data: insert.rows[0],
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ success: false, message: error.message });
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
  listMyEvents,
  getEnrollmentStatus
};
