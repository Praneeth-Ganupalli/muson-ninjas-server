
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const playListRouter = require("./routes/playlist-router");
const userRouter = require('./routes/user-router');
const appErrors = require("./utils/appErrors");
const helmet = require('helmet');
const hpp = require('hpp');
const corsOptions ={
    methods:'*',
    origin:'*',
}
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(hpp());
app.use(helmet());
app.use(cors(corsOptions));
app.use("/api/v1/playlist",playListRouter);
app.use("/api/v1/users",userRouter);
app.all("*",(req,res,next)=>{
    res.status(404).json({
        status:"failed",
        message:'Route not yet defined'
    })
})
app.use((err,req,res,next)=>{
    let error = err;
    if(err.code === 11000)
    {
        error.message = appErrors.handleDuplicateKeyError(error);
    }
    if(err.name==='TokenExpiredError')
    {
        error.message = appErrors.handleJwtExpiredError();
    }
    res.status(400).json({
        status:'failed',
        message:error.message,
        error:err
    })
})
module.exports=app;