import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import iepRoutes from './routes/iep.routes.js'
import schoolRoutes from './routes/school.routes.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/ieps', iepRoutes);
app.use('/api/schools',schoolRoutes )

// health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', database: 'PostgreSQL' });
  });


const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
