import { Otp } from "../Models/Otp.js"
import { Template } from "../Models/Template.js"
import variables from "../Config/variables.js"


const isOtpExpired = async (expiry, req_type) => {
    if (req_type = "email") {

        if (expiry > Date.now()) {
            // let qq = (expiry - Date.now())
            let result = parseInt((expiry - Date.now()) / 1000)
            let mins = parseInt(result / 60)
 
            let seconds = result % 60
            if (seconds < 10) {
                seconds = "0" + seconds
            };
            return { msg: `please try after ${mins}:${seconds} `, resStatus: 0 }
        }

        return { resStatus: 1 };
    }

    //================== MOBILE INTEGRATION PENDING =========================//

    if (type = "mobile") {

        if (expiry > Date.now()) {
            let result = parseInt((expiry - Date.now()) / 1000)
            let mins = parseInt(result / 60)
            let seconds = result % 60
            if (seconds < 10) {
                seconds = "0" + seconds
            };
            return { msg: `please try after ${mins}:${seconds} `, resStatus: 0 }
        }

        return { resStatus: 1 };
    }
  
}


const create_otp = async (type, otp, user_id, req_type, val) => { 

    if(req_type == 'email'){
        let expired_at = Date.now() + 60000
        let Otp_exist = await Otp.findOne({ where: { user_id, type: req_type } });

        if (Otp_exist) {
            let IOE = await isOtpExpired(Otp_exist?.expired_at, req_type);

            if (!IOE.resStatus) {
                return IOE
            }else {
                await Otp_exist.update({ otp, expired_at })
                return { msg: "otp created sucessfully", expired_at, resStatus: 1 };
            }
        }

        await Otp.create({ otp: otp, user_id: user_id, value: val, type: req_type, expired_at: expired_at });
        return { msg: "otp created sucessfully", expired_at, resStatus: 1 };
    }


    //================== MOBILE INTEGRATION PENDING =========================//

    if(req_type == 'mobile'){
        let expired_at = Date.now() + 60000
        let Otp_exist = await Otp.findOne({ where: { user_id, type: req_type } });

        if (Otp_exist) {
            let IOE = await isOtpExpired(Otp_exist?.expired_at, req_type);

            if (!IOE.resStatus) {
                return IOE
            }else {
                await Otp_exist.update({ otp, expired_at })
                return { msg: "otp created sucessfully", expired_at, resStatus: 1 };
            }
        }

        await Otp.create({ otp: otp, user_id: user_id, value: val, type: req_type, expired_at: expired_at });
        return { msg: "otp created sucessfully", expired_at, resStatus: 1 };
    }
 
    
    
}

const getTemplateContent = async (type, temp_type) => { 

    let template = await Template.findOne({
        where: {
            type,
            temp_type,
            status: '1'
        },
        attributes: ['content']
    });

    let default_Content = `This is Otp for ${type} ${variables.mail_dynamic_content}`;


    if (!template) {
        return default_Content;
    }

    return template.content;

}

const verify = async (type, otp, user_id) => {
    let user_otp = await Otp.findOne({ where: { user_id, type } });


    if (!user_otp && user_otp == undefined) {
        return { message: "Try after some time !!", status: 0 }
    }

    if (user_otp.otp != otp) {
        return { message: "Incorrect Otp", status: 0 }; // incorrect otp
    }

    if (user_otp.expired_at < Date.now()) {
        return { message: "OTP Expired !!", status: 0 }
    }

    await user_otp.destroy();

    return { message: "OTP verified !!", status: 1 }
}

export default{
    create_otp,
    getTemplateContent,
    verify
}