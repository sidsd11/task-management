import { useParams } from 'react-router-dom'

import Tasks from '../components/Tasks'

const MyFriendsTasks = () => {
	const { uniqueUserId, name } = useParams()

	return <Tasks type='friend' uniqueUserId={uniqueUserId} name={name} />
}

export default MyFriendsTasks
