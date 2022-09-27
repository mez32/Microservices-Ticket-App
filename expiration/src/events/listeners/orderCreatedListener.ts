import { Listener, OrderCreatedEvent, Subjects } from '@meztickets/common'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queues/expirationQueue'
import { queueGroupName } from './queueGroupName'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime()

		await expirationQueue.add(
			{
				orderId: data.id,
			},
			{
				delay,
			}
		)

		console.log('Waiting this long to process: ', delay)

		msg.ack()
	}
}
