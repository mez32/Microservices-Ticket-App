import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { RequestValidationError } from '../errors/requestValidationError'
import { BadRequestError } from '../errors/badRequestError'

const router = express.Router()

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be 4 to 20 characters'),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			throw new RequestValidationError(errors.array())
		}

		const { email, password } = req.body

		const existingUser = await User.findOne({ email })

		if (existingUser) {
			throw new BadRequestError('Email already in use')
		}

		const user = User.build({
			email,
			password,
		})

		await user.save()

		const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!)

		req.session = {
			jwt: userJwt,
		}

		res.status(201).send(user)
	}
)

export { router as signupRouter }