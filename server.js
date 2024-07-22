const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8000;
const app = require("./app");
const mongoose = require("mongoose");
const dbServer = process.env.DB_SERVER.replace("<PASSWORD>",process.env.DB_PASSWORD);
mongoose.connect(dbServer,{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(()=>{
    console.log("Db Connection Successful...😊");
}).catch((e)=>{
    console.log("Db connection failedd...",e.message);
    console.log("Shutting Down Server... 🔥");
    process.exit(1);
})
const server = app.listen(port,()=>{
    console.log(`Server Started on ${port}`);
})

process.on("uncaughtException",(e)=>{
    console.log("uncaughtException",e.message);
    console.log("Shutting Down Server because of uncaughtException");
    server.close(()=>{
        process.exit(1);
    })
})
process.on("unhandledRejection",(e)=>{
    console.log("unhandledRejection",e.message);
    console.log("Shutting Down Server because of unhandledRejection");
    server.close(()=>{
        process.exit(1);
    })
})