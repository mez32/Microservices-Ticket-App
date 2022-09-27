import { ExpirationCompleteListener } from '../expirationCompleteListener'
import { natsWrapper } from '../../../natsWrapper'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { ExpirationCompleteEvent, OrderStatus } from '@meztickets/common'
import { Order } from '../../../models/order'

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client)

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 25,
	})
	await ticket.save()

	const order = Order.build({
		userId: 'sjdhjask',
		expiresAt: new Date(),
		status: OrderStatus.Created,
		ticket,
	})
	await order.save()

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, ticket, order, data, msg }
}

it('updates order status to cancelled', async () => {
	const { listener, order, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	const updatedOrder = await Order.findById(order.id)

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order:cancelled event', async () => {
	const { listener, order, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(natsWrapper.client.publish).toHaveBeenCalled()

	const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
	expect(eventData.id).toEqual(order.id)
})

it('acks msg', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	expect(msg.ack).toHaveBeenCalled()
})
