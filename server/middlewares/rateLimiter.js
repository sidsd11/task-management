import redisClient from '../config/redis.js'

const rateLimiter = async (req, res, next) => {
	try {
		const ip = req.ip
		const key = `rate-limit:${ip}`
		const requestCount = await redisClient.incr(key)
		if (requestCount === 1) {
			await redisClient.expire(key, 10)
		}
		if (requestCount > 5) {
			return res.status(429).json({
				success: false,
				message: 'Too many requests, please wait for a while'
			})
		}
	} catch (error) {
		console.error('Error in rateLimiter', error)
		//return res.status(500).json({ success: false, message: 'Something went wrong' })
	} finally {
		next()
	}
}

export default rateLimiter
