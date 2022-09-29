import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@meztickets/common'
import express, { Request, response, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { stripe } from '../stripe'
import { PaymentCreatedPublisher } from '../events/publishers/paymentCreatedPublisher'
import { natsWrapper } from '../natsWrapper'

const router = express.Router()

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body

		const order = await Order.findById(orderId)

		if (!order) {
			throw new NotFoundError()
		}
		if (req.currentUser!.id !== order.userId) {
			throw new NotAuthorizedError()
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Order has already been cancelled')
		}

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token,
		})

		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		})
		await payment.save()

		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		})

		res.status(201).send({ id: payment.id })
	}
)

export { router as createChargeRouter }
