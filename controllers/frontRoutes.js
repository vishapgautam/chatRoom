const User=require('./../models/User')
const ChatRooms=require('./../models/ChatRoom')
const jwt=require('jsonwebtoken')
const decode=require('jwt-decode')
const ChatMessageModel=require('./../models/ChatMessages')
module.exports.home=async(req,res)=>{
    res.status(200).render('home.ejs')
}

module.exports.signup=(req,res)=>{
    res.status(200).render('signup.ejs')
}
module.exports.login=async(req,res)=>{
    res.status(200).render('login.ejs')
}
module.exports.login1=async(req,res,next)=>{

    res.clearCookie('email');
        
    try{
        const user=await User.find({email:req.body['email']})
        if (!user) return res.status(400).json({message:"email not found"})
        if (req.body['password']==user[0]['password']) {
            res.cookie('email',user[0]['email'],{
                httpOnly:true,
                maxAge:7*24*60*60*1000
                })
         return next()
            
        }
        return res.status(400).json({message:"wrong password 1"})
    }catch(error){
        console.log(error)
        return res.status(400).json({message:"wrong password"})
    }
}

module.exports.home1=async(req,res)=>{
    try{
        const email= await req.cookies['email']
        const rooms=await ChatRooms.find()
        User.find({email:email}).exec().then(result=>{res.status(200).render('home1.ejs',{rooms:rooms,userName:result[0]['firstName']})})
        // res.status(200).render('home1.ejs',{rooms:rooms,userName:user[0]['firstName']})
    }catch(error){
        console.log(error)
        res.status(400).json({message:"error",error:error})
    }
}

module.exports.chat=async(req,res)=>{
    const options = {
        limit:40
      };
        const message= await ChatMessageModel.find({chatRoomId:req.params.roomId},options)
    
        try{
        let w=[]
        const user=await User.find({email:req.cookies['email']})
        const room=await ChatRooms.findById(req.params.roomId)
        for (let i = 0; i < message.length; i++) {
            const model=await ChatMessageModel.findById({"_id":message[i]['_id']},userProjection={
                message:true,
                UserName:true
                
            })
            w.push(model['UserName'])
            w.push(model.message['messageText'])
          }
        const jwt=req.cookies['jwt']
        for (i=0;i<room.userIds.length;i++){
           if(room.userIds[i][0]===user[0]['_id']){
               return res.status(200).render('chat.ejs',{users:room.userIds,email:req.cookies['email'],roomId:req.params.roomId,jwt:jwt,w:w})
           }
        }
        room.userIds.push([user[0]['_id'],user[0]['firstName']+" "+user[0]['lastName']])
        const newRoom=await ChatRooms.findByIdAndUpdate({_id:req.params.roomId},{userIds:room.userIds})
        res.status(200).render('chat.ejs',{users:newRoom.userIds,email:req.cookies['email'],roomId:req.params.roomId,jwt:jwt,w:w})
    }catch(error){
        res.status(200).json({message:"error"})
    }
}
module.exports.postmessage=async(data)=>{
    const user=await User.find({email:data[1]})
    const messagePayload = {
        messageText: data[0],
      };
      const UserName=user[0]['firstName']+" "+user[0]['lastName']
      const currentLoggedUser = user[0]['_id']
      const post = await ChatMessageModel.createPostInChatRoom(data[2], messagePayload, currentLoggedUser,UserName);
    
}
