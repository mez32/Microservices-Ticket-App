import { PaymentCreatedEvent, Publisher, Subjects } from '@meztickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
