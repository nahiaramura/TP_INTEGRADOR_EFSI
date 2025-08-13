import express from 'express';
import {
  listEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollUser,
  deleteEnrollment,
  listEventLocations,
  listMyEvents,
  getEnrollmentStatus // ✅ asegurate de tener esto exportado
} from '../controllers/event.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js'; // ✅ import correcto

const router = express.Router(); // ✅ primero se declara

// Rutas de eventos
router.get('/', listEvents); // ✅ ahora es pública
router.get('/mine', verifyToken, listMyEvents);
router.get('/:id', getEventDetail);
router.post('/', verifyToken, createEvent);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

// Inscripciones
router.post('/:id/enrollment', verifyToken, enrollUser);
router.delete('/:id/enrollment', verifyToken, deleteEnrollment);
router.get('/:id/enrollment', verifyToken, getEnrollmentStatus);

// (⚠️ esta línea estaba mal ubicada y duplicada)
router.get('/locations', verifyToken, listEventLocations); // 🛠️ si la querés mantener

export default router;
