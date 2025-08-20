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
  getEnrollmentStatus
} from '../controllers/event.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', listEvents);
router.get('/mine', verifyToken, listMyEvents);
router.get('/:id', getEventDetail);
router.post('/', verifyToken, createEvent);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);
router.post('/:id/enrollment', verifyToken, enrollUser);
router.delete('/:id/enrollment', verifyToken, deleteEnrollment);
router.get('/:id/enrollment', verifyToken, getEnrollmentStatus);
router.get('/locations', verifyToken, listEventLocations);

export default router;
