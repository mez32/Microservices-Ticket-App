import React from 'react'
import buildClient from '../api/buildClient'

const index = ({ currentUser }) => {
	return currentUser ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>
}

index.getInitialProps = async (context) => {
	console.log('landing page')
	const client = buildClient(context)

	const { data } = await client.get('/api/users/currentuser').catch((err) => {
		console.log(err)
	})
	return data
}

export default index
