

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { getMaxListeners } = require('nodemailer/lib/xoauth2');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'carrsharee78@gmail.com',
        pass: 'avjo abbf vtvz qhoo'
    }
});

const token = jwt.sign({
        data: 'Token Data'  
    }, 
    'ourSecretKey', { expiresIn: '10m' }  
);    

const mailConfigurations = {

   
    from: 'carrsharee78@gmail.com',

    to: 'danilovicn5@gmail.com',

    
    subject: 'Верификација e-mail адресе',
    
    
    text:`Здраво!
        Ви сте приступили нашем сајту Car Share 
        и унели своју e-mail адресу. 
        Молимо Вас да кликнете на дати 
        линк ради верификације Ваше e-mail адресе.
        http://localhost:3000/verify/${token} 

        Хвала, 
        Надамо се да ћете уживати у коришћењу наших услуга.
    `
};

transporter.sendMail(mailConfigurations, function(error, info){
    if (error) throw Error(error);
    console.log('Email Sent Successfully');
    console.log(info);
});
