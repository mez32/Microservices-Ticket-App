import { Publisher, Subjects, TicketUpdatedEvent } from '@meztickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
