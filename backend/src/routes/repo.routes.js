import { Router } from 'express';
import {
  createRepo, getRepos, getRepo, deleteRepo,
  runCommand, undoCommand, redoCommand,
} from '../controllers/repo.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getRepos);
router.post('/', createRepo);
router.get('/:id', getRepo);
router.delete('/:id', deleteRepo);
router.post('/:id/command', runCommand);
router.post('/:id/undo', undoCommand);
router.post('/:id/redo', redoCommand);

export default router;
