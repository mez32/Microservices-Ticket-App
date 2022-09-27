import { OrderCreatedListener } from '../orderCreatedListener'
import { natsWrapper } from '../../../natsWrapper'
import { Ticket } from '../../../models/ticket'
import { OrderCreatedEvent, OrderStatus } from '@meztickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		title: 'Concert',
		price: 20,
		userId: 'sjdhfalk',
	})
	await ticket.save()

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'jhkhjk',
		expiresAt: 'sdafsd',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, ticket, data, msg }
}

it('sets the orderId of the ticket', async () => {
	const { listener, ticket, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the msg', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(natsWrapper.client.publish).toHaveBeenCalled()

	const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

	expect(data.id).toEqual(ticketUpdatedData.orderId)
})
