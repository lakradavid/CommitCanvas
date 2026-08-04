import { Router } from 'express';
import { getChallenges, getChallenge, completeChallenge } from '../controllers/challenge.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getChallenges);
router.get('/:id', getChallenge);
router.post('/:id/complete', completeChallenge);

export default router;
