import { natsWrapper } from '../../../natsWrapper'
import { Ticket } from '../../../models/ticket'
import { OrderCancelledEvent, OrderStatus } from '@meztickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from '../orderCancelledListener'

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client)

	const orderId = new mongoose.Types.ObjectId().toHexString()

	const ticket = Ticket.build({
		title: 'Concert',
		price: 20,
		userId: 'sjdhfalk',
	})
	ticket.set({ orderId })
	await ticket.save()

	const data: OrderCancelledEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		ticket: {
			id: ticket.id,
		},
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, ticket, orderId, data, msg }
}

it('updates ticket, publishes an event and acks the message', async () => {
	const { listener, data, ticket, orderId, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.orderId).not.toEqual(orderId)
	expect(natsWrapper.client.publish).toHaveBeenCalled()
	expect(msg.ack).toHaveBeenCalled()
})
