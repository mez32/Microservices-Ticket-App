import mongoose from 'mongoose'

import { app } from './app'
import { OrderCancelledListener } from './events/listeners/orderCancelledListener'
import { OrderCreatedListener } from './events/listeners/orderCreateListener'
import { natsWrapper } from './natsWrapper'

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY not defined')
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI not defined')
	}
	if (!process.env.NATS_CLUSTER_ID || !process.env.NATS_CLIENT_ID || !process.env.NATS_URL) {
		throw new Error('NATS env vars not defined')
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		)
		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed')
			process.exit()
		})
		process.on('SIGINT', () => {
			natsWrapper.client.close()
		})
		process.on('SIGTERM', () => {
			natsWrapper.client.close()
		})

		new OrderCreatedListener(natsWrapper.client).listen()
		new OrderCancelledListener(natsWrapper.client).listen()

		await mongoose.connect(process.env.MONGO_URI)
		console.log('Connected to MongoDb - tickets ')
	} catch (error) {
		console.error(error)
	}

	app.listen(3000, () => {
		console.log('Tickets running on port 3000!!')
	})
}

start()
