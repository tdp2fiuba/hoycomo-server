const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "hoy.como.app@gmail.com",
        pass: "hoycomoasdf1234"
    }
});

const defaultMailOptions = {
    from: "Hoy Como ✔ <comercios@hoy.com.o>",
    to: "bar@blurdybloop.com, baz@blurdybloop.com",
    subject: "Hoy Como ✔",
    text: "Enviado por HoyComo ✔"
};

exports.sendTextMail = function(to,subject,text) {
   if (!to || !subject || !text){
       return false;
   }
   const mailOptions = defaultMailOptions;
   mailOptions.to = to;
   mailOptions.subject = subject;
   mailOptions.text = text;

   smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            return false;
        }else{
            console.log("Message sent: ",response.accepted);
            return true;
        }
   });

};


exports.sendHTMLMail = function(to,subject,HTMLtext) {
    if (!to || !subject || !HTMLtext){
        return false;
    }
    const mailOptions = defaultMailOptions;
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.html = HTMLtext;

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            return false;
        }else{
            console.log("Message sent: ",response.accepted);
            return true;
        }
    });

};