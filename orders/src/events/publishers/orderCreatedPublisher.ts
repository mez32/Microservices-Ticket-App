import { Publisher, OrderCreatedEvent, Subjects } from '@meztickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
}
