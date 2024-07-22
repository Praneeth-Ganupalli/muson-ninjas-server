const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");
exports.getUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find().populate({
        path:'playLists',
    });
    res.status(200).json({
        users
    })
})
