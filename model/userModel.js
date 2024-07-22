const mongoose = require("mongoose");
const validator = require("validator");
const brcypt = require("bcrypt");
 const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'User Name is required'],
        trim:true,
        unique:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        trim:true,
        unique:true,
        validate:{
            message:'Please provide proper email',
            validator:validator.isEmail
        }
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        select:false,
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true,'Password Confirmation is required'],
        validate:{
            validator:function(val){
                return this.password === val;
            },
            message:'passwords not matching'
        }
    },
    passwordModifiedAt:Date,
    passwordResetToken:String,
    passwordResetValidFor:Date,
    role:{
        type:String,
        default:'user'
    },
    playLists:{
        type:[{
            type:mongoose.Schema.ObjectId,
            ref:'Playlist'
        }]
    }
})
userSchema.pre('save',async function(next){
    if(this.isModified('password'))
    {
        this.password = await brcypt.hash(this.password,12);
        this.passwordConfirm = undefined;
    }
    next()
})
const User = mongoose.model('User',userSchema);
module.exports=User;