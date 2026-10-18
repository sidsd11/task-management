import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'

import connectDB from './config/mongodb.js'
import rateLimiter from './middlewares/rateLimiter.js'
import { connectRedis } from './config/redis.js'
import userRouter from './routes/userRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import friendRouter from './routes/friendRoutes.js'

const app = express()
app.set('trust proxy', 1)

const port = process.env.PORT || 3000
const allowedOrigins = ['http://localhost:5173']

app.use(cors({ origin: allowedOrigins, credentials: true, exposedHeaders: ['redis-ratelimit-message'] }))
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store')
	next()
})
app.use(express.json())
app.use(cookieParser())
app.use(rateLimiter)

app.get('/', (req, res) => {
	res.send('API Working')
})

app.use('/api/user', userRouter)
app.use('/api/task', taskRouter)
app.use('/api/friend', friendRouter)

const startServer = async () => {
	try {
		await connectDB()
		await connectRedis()

		app.listen(port, () => {
			console.log(`Server listening on port: ${port}`)
		})
	} catch (error) {
		console.error('Error starting server:', error)
		process.exit(1)
	}
}

startServer()
