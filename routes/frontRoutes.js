const express=require('express');
const controller=require('./../controllers/frontRoutes')
const router=express.Router();

router
      .get('/',controller.home)
      .get('/login',controller.login)
      .get('/signup',controller.signup)
      .post('/login',controller.login1,controller.home1)
      .get('/home',controller.home1)
      .get('/chat/:roomId',controller.chat)
    //   .delete('/:id',user.onDeleteUserById)

module.exports=router;