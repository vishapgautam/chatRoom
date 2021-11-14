const express=require('express');

const chatRoom=require('./../controllers/chatRoom')

const router=express.Router();

router
     .get('/allRooms',chatRoom.getAllChatRooms)
     .get('/:page',chatRoom.getRecentConversation)
     .get('/:roomId',chatRoom.getConversationByRoomId)
     .post('/initiate',chatRoom.initiate)
     .post('/:roomId/message',chatRoom.postMessage)
     .put('/:roomId/mark-read',chatRoom.markConversationReadByRoomId)

module.exports=router; 