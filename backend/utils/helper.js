
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error,success)=>{
  if(error){
console.log("verification is failed",error.message);
  }else{
    console.log("server of mail is ready to send email");

  }
});

 const sendEmail = async({ to, subject, html })=>{
  try{
    const info = await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    console.log("messageid:" ,info.messageId);
  }catch(err){
    console.log("err of email occurs:", err)
  }
}

const generateOTP = (length)=>{
  if(!length || length <= 0){
    throw new Error("length of otp cant be 0")
  }

  let otp = "";

  for(let i =0;i<length;i++){
    otp += Math.floor(Math.random()*10);
  }
  return otp;
}

module.exports = { transporter, sendEmail ,generateOTP};
































