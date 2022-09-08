import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import cookieSession from 'cookie-session'

import { currentUserRouter } from './routes/currentUser'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

import { errorHandler } from './middlewares/errorHandler'
import { NotFoundError } from './errors/notFoundError'

const app = express()

// trust proxy during dev
app.set('trust proxy', true)

app.use(json())
app.use(
	cookieSession({
		signed: false,
		secure: true,
	})
)

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.all('*', async () => {
	throw new NotFoundError()
})

app.use(errorHandler)

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
		console.log('Auth running on port 3000!')
	})
}

start()
