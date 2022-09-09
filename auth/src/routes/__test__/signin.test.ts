import request from 'supertest'
import { app } from '../../app'

it('returns a 200 on a successful sign in', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200)
})

it('returns a 400 with a login attempt from a new user', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400)
})

it('returns a 400 on a unsuccessful sign in, bad password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'passw',
		})
		.expect(400)
})

it('returns a 400 on a unsuccessful sign in, bad email', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'testtest.com',
			password: 'password',
		})
		.expect(400)
})

it('sets cookie on a successful sign in', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200)

	expect(response.get('Set-Cookie')).toBeDefined()
})
