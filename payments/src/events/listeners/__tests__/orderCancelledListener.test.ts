import { OrderCancelledEvent, OrderStatus } from '@meztickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../natsWrapper'
import { OrderCancelledListener } from '../orderCancelledListener'

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client)

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: 'sdjhakjsd',
		price: 40,
		status: OrderStatus.Created,
	})
	await order.save()

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: 'sdjhafk',
		},
	}

	const msg: Partial<Message> = {
		ack: jest.fn(),
	}

	return { listener, data, msg, order }
}

it('marks order as cancelled and acks msg', async () => {
	const { listener, data, order, msg } = await setup()

	await listener.onMessage(data, msg as Message)

	const updatedOrder = await Order.findById(order.id)

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
	expect(msg.ack).toHaveBeenCalled()
})
