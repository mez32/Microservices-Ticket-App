import { OrderStatus } from '@meztickets/common'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../natsWrapper'

it('marks an order as cancelled', async () => {
	const user = global.signin()

	const ticket = Ticket.build({
		title: 'Concert',
		price: 20,
	})
	await ticket.save()

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204)

	const updatedOrder = await Order.findById(order.id)

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an event', async () => {
	const user = global.signin()

	const ticket = Ticket.build({
		title: 'Concert',
		price: 20,
	})
	await ticket.save()

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
