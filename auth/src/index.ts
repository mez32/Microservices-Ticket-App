import mongoose from 'mongoose'

import { app } from './app'

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY not defined')
	}
	try {
		await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')
		console.log('Connected to MongoDb')
	} catch (error) {
		console.error(error)
	}

	app.listen(3000, () => {
		console.log('Auth running on port 3000!!')
	})
}

start()
