import express from 'express';
import { getAllTags } from '../controllers/tag.controller.js';

const router = express.Router();

router.get('/', getAllTags);

export default router;

