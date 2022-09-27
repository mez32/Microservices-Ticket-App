import { OrderCreatedEvent, OrderStatus } from '@meztickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../natsWrapper'
import { OrderCreatedListener } from '../orderCreateListener'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'asdfjhasdkjf',
		expiresAt: 'sdhjfsk',
		ticket: {
			id: 'sdjhafk',
			price: 25,
		},
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, data, msg }
}

it('create an order and acks the message', async () => {
	const { listener, msg, data } = await setup()

	await listener.onMessage(data, msg as Message)

	const order = await Order.findById(data.id)

	expect(order!.id).toEqual(data.id)
	expect(order!.price).toEqual(data.ticket.price)
	expect(msg.ack).toHaveBeenCalled()
})
