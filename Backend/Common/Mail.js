import nodeMailer from 'nodemailer'
import variables from '../Config/variables.js';

export default {
    send: async (to, message) => {
        let transporter = nodeMailer.createTransport({
            host: variables.MAIL_HOST,
            port: variables.MAIL_PORT,
            secure: false,
            auth: {
                user: variables.MAIL_USERNAME,
                pass: variables.MAIL_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
        });

        let mailOptions = {
            from: variables.MAIL_FROM_ADDRESS, // sender address
            to: to, // list of receivers
            subject: 'Test', // Subject line
            text: message, // plain text body
            html: '<b>' + message + '</b>' // html body
        };

        
        try{
            await transporter.sendMail(mailOptions);
            return 1;
        }catch(error){
            console.log(error);
            return 0;
        }

    }
}