import { Router } from 'express';
import { getHistory, deleteHistory } from '../controllers/history.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getHistory);
router.delete('/', deleteHistory);

export default router;
