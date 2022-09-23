import { Publisher, OrderCancelledEvent, Subjects } from '@meztickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
