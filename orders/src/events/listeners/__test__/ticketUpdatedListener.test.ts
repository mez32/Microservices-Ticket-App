import { TicketUpdatedEvent } from '@meztickets/common'
import { TicketUpdatedListener } from '../ticketUpdatedListener'
import { natsWrapper } from '../../../natsWrapper'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 30,
	})

	await ticket.save()

	const data: TicketUpdatedEvent['data'] = {
		version: ticket.version + 1,
		id: ticket.id,
		title: 'New Concert',
		price: 20,
		userId: new mongoose.Types.ObjectId().toHexString(),
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, data, msg, ticket }
}

it('finds, updates and saves the ticket', async () => {
	const { listener, data, msg, ticket } = await setup()

	await listener.onMessage(data, msg as Message)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.title).toEqual(data.title)
	expect(updatedTicket!.price).toEqual(data.price)
	expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
	const { listener, data, msg, ticket } = await setup()

	data.version = 10

	try {
		await listener.onMessage(data, msg as Message)
	} catch (error) {}

	expect(msg.ack).not.toHaveBeenCalled()
})
