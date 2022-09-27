import { Listener, OrderCreatedEvent, Subjects } from '@meztickets/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'
import { queuGroupName } from './queueGroupName'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queuGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const order = Order.build({
			id: data.id,
			version: data.version,
			status: data.status,
			userId: data.userId,
			price: data.ticket.price,
		})
		await order.save()

		msg.ack()
	}
}
