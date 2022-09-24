import { TicketCreatedEvent } from '@meztickets/common'
import { TicketCreatedListener } from '../ticketCreatedListener'
import { natsWrapper } from '../../../natsWrapper'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
	const listener = new TicketCreatedListener(natsWrapper.client)

	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 20,
		userId: new mongoose.Types.ObjectId().toHexString(),
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	const ticket = await Ticket.findById(data.id)

	expect(ticket).toBeDefined()
	expect(ticket!.title).toEqual(data.title)
	expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(msg.ack).toHaveBeenCalled()
})
