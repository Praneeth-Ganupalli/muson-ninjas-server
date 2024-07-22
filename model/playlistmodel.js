const mongoose = require('mongoose');
const User = require("../model/userModel");
const slugify = require('slugify');
const songSchema = new mongoose.Schema({
    artist: {
        type:String,
        required:[true,'Artist is required for a song']
    },
    title: {
        type:String,
        required:[true,'Title is required for a song'],
    }
  });
const playlistSchema = new mongoose.Schema({
 title:{
    type:String,
    trim:true,
    unique:true,
    required:[true,'Playlist Title is required']
 },
 coverUrl:{
    type:String,
    default:'https://www.pixelstalk.net/wp-content/uploads/2016/08/Background-Beautiful-Nature-Full-HD.jpg'
 },
 songs:{
    type:[songSchema],
    default:[],
    select:false,
 },
 songsCount:{
   type:Number,
   default:0
 },
 description:{
    type:String,
    required:[true,'Playlist Desscription is required'],
 },
 createdBy:{
   type:mongoose.Schema.ObjectId,
   ref:"User"
 },
 slug:{
    type:String
 }
},{
   toJSON:{virtuals:true},
   toObject:{virtuals:true}
})
playlistSchema.pre(/^find/,function(next){
   this.populate({
      path:'createdBy',
      select:'name'
   })
   next();
})
playlistSchema.pre("save",function(next){
   if(this.isModified('songs'))
   {
      this.songsCount = this.songs.length;
   }
   next();
})
playlistSchema.pre("save",function(next){
   if(this.isModified('title'))
   {
      this.slug = slugify(this.title,{lower:true});
   }
   next();
})
playlistSchema.post("save",async function(){
   const user = await User.findById(this.createdBy);
   user.playLists.push(this.id);
   await user.save({validateBeforeSave:false});
})
playlistSchema.methods.isUniqueSong = function(title){
    const isUnique = this.songs.every(song=>`${song.title}-${song.artist}`!==title);
    return isUnique;
}
const Playlist = mongoose.model('Playlist',playlistSchema);
module.exports = Playlist;