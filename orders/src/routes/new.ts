import express, { Request, Response } from 'express'
import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	Subjects,
	validateRequest,
} from '@meztickets/common'
import { body } from 'express-validator'

import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import mongoose from 'mongoose'
import { OrderCreatedPublisher } from '../events/publishers/orderCreatedPublisher'
import { natsWrapper } from '../natsWrapper'

const EXPIRATION_WINDOW_SECONDS = 1 * 60

const router = express.Router()

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body

		const ticket = await Ticket.findById(ticketId)
		if (!ticket) {
			throw new NotFoundError()
		}

		const isReserved = await ticket.isReserved()
		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved')
		}

		const expiration = new Date()
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		})

		await order.save()
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			status: order.status,
			userId: req.currentUser!.id,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		})

		res.status(201).send(order)
	}
)

export { router as newOrderRouter }
