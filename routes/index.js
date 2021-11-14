const express=require('express');
const users=require('./../controllers/user')

const middleware=require('./../middlewares/jwt');


const router=express.Router();
router.post('/login/:userId',middleware.encode,(req,res,next)=>{
    return res
      .status(200)
      .json({
        success: true,
        authorization:req.authToken,
      });
});

module.exports=router;