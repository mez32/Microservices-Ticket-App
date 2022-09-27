import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../natsWrapper'
import { Ticket } from '../../models/ticket'

it('returns a 404 if the provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({ title: 'Ticket', price: 10 })
		.expect(404)
})

it('returns a 401 if user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	await request(app).put(`/api/tickets/${id}`).send({ title: 'Ticket' }).expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'Ticket',
			price: 15,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'New Ticket',
			price: 50,
		})
		.expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
	const cookie = global.signin()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Ticket',
			price: 15,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 50,
		})
		.expect(400)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New ticket',
			price: -30,
		})
		.expect(400)
})

it('updates the ticket with valid inputs', async () => {
	const cookie = global.signin()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Ticket',
			price: 15,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New ticket',
			price: 50,
		})
		.expect(200)

	const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send({})

	expect(ticketResponse.body.title).toEqual('New ticket')
	expect(ticketResponse.body.price).toEqual(50)
})

it('publishes an event', async () => {
	const cookie = global.signin()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Ticket',
			price: 15,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New ticket',
			price: 50,
		})
		.expect(200)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
	const cookie = global.signin()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Ticket',
			price: 15,
		})
		.expect(201)

	const ticket = await Ticket.findById(response.body.id)
	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
	await ticket!.save()

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New ticket',
			price: 50,
		})
		.expect(400)
})
