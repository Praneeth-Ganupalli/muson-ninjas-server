const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require("../utils/emailService");
exports.signToken = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
    return token;
}
exports.signUp = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm
    })
    const { name: userName, email: userEmail, id, role } = newUser;
    const userDetails = {
        name: userName,
        email: userEmail,
        id,
        role
    }
    const token = this.signToken(newUser.id);
    res.status(200).json({
        status: 'success',
        data: userDetails,
        token
    })
})
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new Error('Email and password is required');
    }
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        throw new Error('User doesnt Exist');
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Invalid Email or Password");
    }
    const token = this.signToken(user.id);
    res.status(200).json({
        status: 'success',
        data: {
            name: user.name,
            role: user.role,
            email: user.email,
            id: user.id
        },
        token
    })

})

exports.protected = catchAsync(async (req, res, next) => {
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({
            message: 'Please login to use this'
        })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user) {
        return res.status(403).json({
            message: 'unauthorized to use this'
        })
    }
    if (user.passwordModifiedAt && user.passwordModifiedAt > (decodedToken.iat * 1000)) {
        return res.status(500).json({
            message: 'user recently changed password please login again'
        })
    }
    req.user = user;
    next();
})
exports.sendResetTokenForUser = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'user not found'
        })
    }
    const token = crypto.randomBytes(12).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);
    user.passwordResetToken = hashedToken;
    user.passwordResetValidFor = new Date(Date.now() + (5 * 60 * 60 * 1000));
    await user.save({ validateBeforeSave: false });
    const content = `Hi ${user.name} here is your access code ${token} to reset your password this will be valid only for 5mins `
    await sendEmail(email, 'Password Reset Token valid for 5 mins', content);
    res.status(200).json({
        status: "success",
        message: `Token sent for your ${email} please senter the code`
    })
})
const isValidAccessCode = async (code, user) => {
    let result = 'invalid';
    const isValidCode = await bcrypt.compare(code, user.passwordResetToken);
    if (isValidCode) {
        if (Date.now() > user.passwordResetValidFor) {
            result = 'expired'
        }
        else {
            result = 'valid';
        }
    }
    return result;
}
exports.validatePasswordAccessCode = catchAsync(async (req, res) => {
    const { accessCode, email } = req.body;
    if (!accessCode || !email) {
        return res.status(400).json({
            status: 'failed',
            message: 'Access Code and Email are required'
        })
    }
    const user = await User.findOne({ email });
    const codeValidity = await isValidAccessCode(accessCode, user);
    if (codeValidity === 'valid') {
        return res.status(200).json({
            status: 'success',
            message: 'Token validated successfully'
        })
    }
    else if (codeValidity === 'expired') {
        return res.status(401).json({
            status: 'failed',
            message: 'Access Code Expired.'
        })
    }
    else {
        res.status(401).json({
            status: 'failed',
            message: 'Invalid access code'
        })
    }
})

exports.resetPasswordWithCode = catchAsync(async (req, res) => {
    const { email, password, accessCode } = req.body;
    const user = await User.findOne({email});
    if(!user)
    {
        return res.status(404).json({
            status:'failed',
            message:'Unable to find user'
        })
    }
    const codeValidity = await isValidAccessCode(accessCode,user);
    if (codeValidity === 'valid') {
        user.password = password;
        user.passwordConfirm = password;
        user.passwordResetToken = undefined;
        user.passwordResetValidFor = undefined;
        user.passwordModifiedAt = Date.now();
        await user.save({validateBeforeSave:false});
        return res.status(200).json({
            status: 'success',
            message: 'Password reset successfully please login again to continue'
        })
    }
    else if (codeValidity === 'expired') {
        return res.status(401).json({
            status: 'failed',
            message: 'Access Code Expired.'
        })
    }
    else {
        res.status(401).json({
            status: 'failed',
            message: 'Invalid access code'
        })
    }
})
