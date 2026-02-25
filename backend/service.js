import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { login, logout, getMe } from './controllers/auth.js'
import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import iepRoutes from './routes/iep.routes.js'
import schoolRoutes from './routes/school.routes.js'
import assistantRoutes from './routes/assistant.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.use(cors())
app.use(express.json())

// Health and debug (no prefix so easy to curl)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'PostgreSQL', server: 'iep-backend' })
})

// Auth routes – register first so they always exist
app.post('/api/auth/login', login)
app.post('/api/auth/logout', logout)
app.get('/api/auth/me', getMe)
app.use('/api/auth', authRoutes)

app.use('/api/students', studentRoutes)
app.use('/api/ieps', iepRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/assistant', assistantRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`  POST http://localhost:${PORT}/api/auth/login`)
})
