import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { protect } from './middlewares/authMiddleware.js';
import itemRoutes from './routes/itemRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/items', itemRoutes);
// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CampusClaim API is running...');
});

app.get('/api/test', protect, (req, res) => {
  res.json({
    message: "You have accessed a protected route!",
    user: req.user // This shows the student data attached by the middleware
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));