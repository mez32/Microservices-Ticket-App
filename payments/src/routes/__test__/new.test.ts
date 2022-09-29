import { OrderStatus } from '@meztickets/common'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'

jest.mock('../../stripe.ts')

it('returns a 404 on an order that does not exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ token: 'asdjhfajksd', orderId: new mongoose.Types.ObjectId().toHexString() })
		.expect(404)
})

it('returns a 401 when a different user tries to pay', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		price: 20,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ token: 'asdjhfajksd', orderId: order.id })
		.expect(401)
})

it('returns a 400 when the status has been set to cancelled', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Cancelled,
		price: 20,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(order.userId))
		.send({ token: 'asdjhfajksd', orderId: order.id })
		.expect(400)
})

it('returns a 204 with valid inputs', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		price: 20,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(order.userId))
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(201)

	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

	expect(stripe.charges.create).toHaveBeenCalled()
	expect(chargeOptions.currency).toEqual('usd')
	expect(chargeOptions.source).toEqual('tok_visa')
	expect(chargeOptions.amount).toEqual(order.price * 100)
})
