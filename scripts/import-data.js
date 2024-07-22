const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const playlists = JSON.parse(fs.readFileSync(`${__dirname}/../data/mockPlayList.json`));
const PlayList = require("../model/playlistmodel");
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
const importData = async()=>{
    try{
        await PlayList.create(playlists);
        console.log("Data Imported Success fully...")
    }
    catch(e)
    {
        console.log("Failed to import Data",e.message);
    }
    finally{
        process.exit(1);
    }
}
const deleteData = async()=>{
    try{
        await PlayList.deleteMany();
        console.log("Data Deletedd....")
    }
    catch(e)
    {
        console.log("Failed to Delete Data",e.message);
    }
    finally{
        process.exit(1);
    }
}

if(process.argv[2]==="--import")
{
    importData();
}
else if(process.argv[2]==="--delete")
{
    deleteData();
}
else{
    console.log("No valid command exiting....");
    process.exit(1);
}