import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on a successful sign up', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)
})

it('returns a 400 with a bad email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'testtest.com',
			password: 'password',
		})
		.expect(400)
})

it('returns a 400 with a bad password', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'pa',
		})
		.expect(400)
})

it('returns a 400 with no email or password', async () => {
	await request(app).post('/api/users/signup').send({ email: 'test@test.com' }).expect(400)
	return request(app).post('/api/users/signup').send({ password: 'password' }).expect(400)
})

it('Disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400)
})

it('sets a cookie after successful sign up', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)

	expect(response.get('Set-Cookie')).toBeDefined()
})
