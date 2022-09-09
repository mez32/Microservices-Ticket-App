import React from 'react'
import axios from 'axios'

const index = ({ currentUser }) => {
	console.log(currentUser)
	return <div>Landing Page</div>
}

index.getInitialProps = async () => {
	const response = await axios.get('/api/users/currentuser')

	return response.data
}

export default index
