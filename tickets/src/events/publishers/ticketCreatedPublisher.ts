import { Publisher, Subjects, TicketCreatedEvent } from '@meztickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated
}
