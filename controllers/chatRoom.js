const makeValidation = require('@withvoid/make-validation');
const ChatRoomModel=require('./../models/ChatRoom')
const ChatMessageModel=require('./../models/ChatMessages')
const UserModel=require('./../models/User')
const CHAT_ROOM_TYPES={
    CONSUMER_TO_CONSUMER:"consumer-to-consumer",
    CONSUMER_TO_SUPPORT:"consumer-to-support"
};

module.exports.initiate=async(req,res)=>{
    try {
        const validation = makeValidation(types => ({
          payload: req.body,
          checks: {
            userIds: { 
              type: types.array, 
              options: { unique: true, empty: false, stringOnly: true } 
            },
            type: { type: types.enum, options: { enum: CHAT_ROOM_TYPES } },
          }
        }));
        if (!validation.success) return res.status(400).json({ ...validation });
    
        const { userIds, type } = req.body;
        const { userId: chatInitiator } = req;
        const allUserIds = [...userIds, chatInitiator];
        const chatRoom = await ChatRoomModel.initiateChat(allUserIds, type, chatInitiator);
        return res.status(200).json({ success: true, chatRoom });
      } catch (error) {
          console.log(error)
        return res.status(500).json({ success: false, error: error })
      }
}
module.exports.postMessage=async(req,res)=>{
    try {
        const  roomId = req.cookies['jwt'];
        const validation = makeValidation(types => ({
          payload: req.body,
          checks: {
            messageText: { type: types.string },
          }
        }));
        if (!validation.success) return res.status(400).json({ ...validation });
    
        const messagePayload = {
          messageText: req.body.messageText,
        };
        const currentLoggedUser = req.userId;
        const post = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
        global.io.sockets.in(roomId).emit('new message', { message: post });
        return res.status(200).json({ success: true,post: post});
      } catch (error) {
          console.log(error)
        return res.status(500).json({ success: false, error: error })
      }
}
module.exports.getRecentConversation=async(req,res)=>{
  try{
    const pageOptions = {
      page:(req.params.page|| 1)*1,
      limit:5
  }
   ChatMessageModel.find()
  .skip(pageOptions.page * pageOptions.limit)
  .limit(pageOptions.limit)
  .sort({createdAt:-1})
  .exec(function (err, doc) {
      if(err) { res.status(500).json(err); return; };
      res.status(200).json(doc);
  });
  }catch(error){
    return res.status(400).json({message:'fail',error:error})
  }
}
module.exports.getConversationByRoomId=async(req,res)=>{

    try {
        const { roomId } = req.params;
        const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
        if (!room) {
          return res.status(400).json({
            success: false,
            message: 'No room exists for this id',
          })
        }
        const users = await UserModel.getUserByIds(room.userIds);
        const options = {
          page: parseInt(req.query.page) || 0,
          limit: parseInt(req.query.limit) || 10,
        };
        const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
        return res.status(200).json({
          success: true,
          conversation,
          users,
        });
      } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error });
      }
}
module.exports.markConversationReadByRoomId=async(req,res)=>{
    try {
        const { roomId } = req.params;
        const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
        if (!room) {
          return res.status(400).json({
            success: false,
            message: 'No room exists for this id',
          })
        }
    
        const currentLoggedUser = req.userId;
        const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);
        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error });
      }
}

module.exports.getAllChatRooms=async (req,res)=>{
  try{
      const rooms=await ChatRoomModel.find()
      if(!rooms) return res.status(401).json({message:"No room created yet"})
     
      res.status(200).json({message:"success",Number:rooms.length,room:rooms})

  }catch(error){
    return res.status(400).json({status:'fail',error:error})
  }
}
