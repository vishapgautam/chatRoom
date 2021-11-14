const http=require('http')
const express=require('express')
const morgan=require('morgan')
const cors=require('cors');
const cookieParser=require('cookie-parser')
require('./../config/mongo')
const WebSockets=require('./../utils/WebSockets')
const chatRoom=require('./../controllers/chatRoom')

const router=express.Router();


const indexRouter =require('./../routes/index.js')
const frontRoutes=require('./../routes/frontRoutes')
const userRouter=require('./../routes/user')
const chatRoomRouter=require('./../routes/chatRoom')
const deleteRouter=require('./../routes/delete');


const frontController=require('./../controllers/frontRoutes')

var logger = morgan('combined')
const jwtt=require('./../middlewares/jwt');
const { json } = require('body-parser');

const app=express();

app.set("view engine","ejs")
// app.use(compression())
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin:[process.env.URL]
}))
app.use(express.static("views"));
app.use(express.static("public"));

const port =process.env.PORT||5000;
app.set("port",port);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/',indexRouter)
app.use('/api',frontRoutes)
app.use('/users',userRouter)
app.use('/room',jwtt.decode,chatRoomRouter);
app.use('/delete',deleteRouter);


app.use('*',(req,res)=>{
    return res.status(404).json({success:false,message:'API endpoint doesnt exist'})
})



const server=http.createServer(app);
server.listen(port)

const io=require('socket.io')(server,{cors:{origin:"*"}})
   io.on('connection',(socket)=>{
    console.log(socket.id)
    
    
    socket.on('message',(data)=>{
        console.log(data)
        frontController.postmessage(data)

    })
})



server.on('listining',()=>{
    console.log('Server is listining on port 5000...')
})