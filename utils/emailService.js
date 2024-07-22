const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: process.env.BREVO_PORT,
    secure: false, 
    auth: {
      user: process.env.BREVO_USER, 
      pass: process.env.BREVO_PASS
    }
  })
exports.sendEmail  = async (to,subject,content)=>{
    const mailOptions = {
        from: process.env.BREVO_SENDER_EMAIL,
        to: to, 
        subject: subject,
        text: content,
      };
    return transporter.sendMail(mailOptions,(err)=>{
        if(err)
        {
            throw err;
        }
    })
}