import express from 'express'

import { isFriend, userAuth } from '../middlewares/authUser.js'
import { acceptOrDeleteFriendRequest, copyFriendsTask, deleteSentFriendRequest, getFriendsData, removeFriend, sendFriendRequest } from '../controllers/friendControllers.js'

const friendRouter = express.Router()

/* Protected Routes */
friendRouter.use(userAuth)

friendRouter.post('/get-friends-data/:friendUniqueUserId', isFriend, getFriendsData)

friendRouter.patch('/copy-friends-task/:friendUniqueUserId/:taskId', isFriend, copyFriendsTask)
friendRouter.patch('/send-friend-request/:friendUniqueUserId', isFriend, sendFriendRequest)
friendRouter.patch('/delete-sent-friend-request/:friendUniqueUserId', isFriend, deleteSentFriendRequest)
friendRouter.patch('/friend-request/:action/:friendUniqueUserId', isFriend, acceptOrDeleteFriendRequest)

friendRouter.delete('/remove-friend/:friendUniqueUserId', isFriend, removeFriend)

export default friendRouter
