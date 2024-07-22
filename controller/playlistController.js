const fs = require('fs');
const Playlist = require("../model/playlistmodel");
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const storage = multer.memoryStorage();
const {uploadImage} = require("../utils/cloudinary");
const filterPath=(req,file,cb)=>{
    if(file.mimetype?.startsWith('image'))
    {
        cb(null,true);
    }
    else{
        cb('Please Provide Image',false);
    }
}
exports.uploader = multer({
    fileFilter:filterPath,
    storage:storage
});

exports.getAllPlayLists = catchAsync(async(req,res,next)=>{
    const playlists= await Playlist.find();
    res.status(200).json({
        status:"success",
        data:playlists,
        totalResults:playlists.length
    })
})

exports.getPlayList = catchAsync(async(req,res,next)=>{
   const {slug} = req.params;
    const playList = await Playlist.findOne({slug}).select('+songs');
    if(playList)
    {
        res.status(200).json({
            status:"success",
            data:playList
        })
    }
    else{
        res.status(404).json({
            status:"error",
            message:'Play List Not Found.'
        })
    }
})
exports.createPlaylist = catchAsync(async(req,res,next)=>{
    if(req.body.songs && req.body.songs.length)
    {
        const isDuplicateSongsProvided = req.body.songs.reduce((acc,cur)=>{
            const song = `${cur.title}-${cur.artist}`;
            if(acc[song])
            {
                acc.isDuplicated = true
                return acc;
            }
            acc[song] = song;
            return acc;
        },{
            isDuplicated:false
        });
        if(isDuplicateSongsProvided.isDuplicated)
        {
            return res.status(400).json({
                status:"error",
                message:"Duplicate songs provided"
            })
        }
    }
    else{
        req.body.songs=[]
    }
    const {title,description,songs} = req.body;
    const newPlayList = await Playlist.create({title,description,songs,createdBy:req.user.id});
    if(newPlayList)
    {
        if(req.file)
        {
            newPlayList.coverUrl = await uploadImage(req.file.buffer,`${newPlayList.id}-cover`);
            await newPlayList.save({validateBeforeSave:false});
        }
        return res.status(201).json({
            status:"success",
            data:newPlayList,
            message:'Playlist created.'
        })
    }
    res.status(500).json({
        status:"Error",
        message:'Unable to create playlist'
    })
})
exports.deletePlayList = catchAsync(async(req,res,next)=>{
    const {id} = req.params;
    const deletedPlaylist = await Playlist.findOneAndDelete({_id:id,createdBy:req.user.id});
    if(deletedPlaylist)
    {
        return res.status(204).json({
            status:'success',
            message:"Deleted"
        })
    }
    res.status(404).json({
        status:'error',
        message:"playlist id not found"
    })
})

exports.addSongToPlaylist = catchAsync(async(req,res,next)=>{
    const {playlistId} = req.params;
    const {title,artist} = req.body;
    if(!title || !artist)
    {
        return res.status(400).json({
            status:"failed",
            message:"Title and Artist are Mandatory"
        })
    }
    const playlist = await Playlist.findOne({_id:playlistId,createdBy:req.user.id}).select('+songs');
    if(!playlist)
    {
        return res.status(404).json({
            status:"failed",
            message:"playlist not found"
        })
    }
    const isUnique = await playlist.isUniqueSong(`${title}-${artist}`);
    if(!isUnique)
    {
       return res.status(400).json({
            status:"failed",
            message:"Song with similar artist already exists"
        })
    }
    playlist.songs.push({
        title,
        artist
    })
    const updatedPlayList = await playlist.save({validateBeforeSave:false});
    res.status(201).json({
        status:"success",
        message:"song added",
        data:updatedPlayList
    })
})
exports.deleteSongFromPlaylist = catchAsync(async(req,res,next)=>{
    const {playlistId,songId} = req.params;
    const playlist = await Playlist.findOne({_id:playlistId,createdBy:req.user.id}).select('+songs');
    if(!playlist)
    {
        return res.status(404).json({
            status:"failed",
            message:"play list not found"
        })
    }
    const songIndex = playlist.songs.findIndex(song=>song.id===songId);
    if(songIndex === -1)
    {
        return res.status(404).json({
            status:"failed",
            message:"song not found"
        })
    }
    playlist.songs = playlist.songs.filter(song=>song.id!==songId);
    await playlist.save();
    res.status(204).json({
        status:"success",
        message:"song deleted",
    })
})

exports.getMyPlaylists=catchAsync(async(req,res,next)=>{
    const userPlayLists = await Playlist.find({createdBy:req.user.id});
    res.status(200).json({
        status:'success',
        data:userPlayLists
    })
})