import express from 'express';
const router = express.Router();
import { register, login, getMe } from '../controllers/authController.js'; 
import { protect } from '../middlewares/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;