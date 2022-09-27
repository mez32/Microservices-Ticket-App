import { ExpirationCompleteEvent, Subjects, Publisher } from '@meztickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}
