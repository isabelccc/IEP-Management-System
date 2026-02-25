import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  chat,
  generatePresentLevels,
  generateGoals,
  analyzeGoal,
  suggestAccommodations,
} from '../controllers/assistant.js';

const router = express.Router();

router.use(requireAuth);

router.post('/chat', chat);
router.post('/present-levels', generatePresentLevels);
router.post('/goals/generate', generateGoals);
router.post('/goals/analyze', analyzeGoal);
router.post('/accommodations/suggest', suggestAccommodations);

export default router;
