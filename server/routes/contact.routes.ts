import { Router } from 'express';
import { 
  createContactSubmission,
  getContactSubmissions,
  getContactSubmissionById,
  markContactSubmissionAsRead,
  deleteContactSubmission
} from '../controllers/contact.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/', createContactSubmission);

// Admin-only routes
router.get('/', isAdmin, getContactSubmissions);
router.get('/:id', isAdmin, getContactSubmissionById);
router.patch('/:id/read', isAdmin, markContactSubmissionAsRead);
router.delete('/:id', isAdmin, deleteContactSubmission);

export default router;