const jwt=require('jsonwebtoken');
const UserModel=require('./../models/User')
const SECRET_KEY='vishap'//We will move this to env later
module.exports.encode=async(req,res,next)=>{
    try{
        const userId=req.body['userId'];
        // const user=await UserModel.getUserById(userId);
        const payload={
            userId:userId,
            userEmail:user.body['email'],
            userType:user.body['type'],
        };
        const authToken=jwt.sign(payload,SECRET_KEY)
        console.log('Auth',authToken);
        req.authToken=authToken;
        res.cookie('jwt',token,{
        httpOnly:true,
        maxAge:7*24*60*60*1000
        })
        next();
    }catch(error){
        return res.status(400).json({success:false,message:error.error})
    }

}
module.exports.decode=async(req,res,next)=>{
    if(!req.cookies['jwt']) return res.status(400).json({message:"token not found"})
    // if(!req.headers['authorization']){
    //     return res.status(400).json({success:false,message:"NO token provided"})
    //}
    // const accessToken=req.headers.authorization.split(' ')[1];
    const accessToken=req.cookies['jwt']
    try{
        const decode=jwt.verify(accessToken,SECRET_KEY);
        req.body['email']=decode.email
        // req.userId=decode.userId;
        // req.userType=decode.type;
        const user=await UserModel.find({email:req.body['email']})
        if(!user) return res.status(400).json({message:"email not found"})
        if(!req.body['password']==user.password) return res.status(400).json({message:"wrong password"})
        return next();
    }catch(error){
        return res.status(401).json({success:false,message:error.message})
    }
}
