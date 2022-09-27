import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@meztickets/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'
import { queuGroupName } from './queueGroupName'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
	queueGroupName = queuGroupName

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const order = await Order.findOne({
			_id: data.id,
			version: data.version - 1,
		})

		if (!order) {
			throw new Error('Order not found')
		}

		order.set({ status: OrderStatus.Cancelled })
		await order.save()

		msg.ack()
	}
}
