import CValidator from "../Validator/CustomValidation.js"
import reply from "../Common/reply.js";
import Helper from "../Common/Helper.js";
import variables from "../Config/variables.js";
import Mail from "../Common/Mail.js";
import { User } from "../Models/User.js";
import { UserMeta } from "../Models/UserMeta..js";
import {Token} from "../Models/Token.js"
import _ from "lodash";
import { Op } from "sequelize";
import bcrypt from "bcrypt"
import crypto, { createDiffieHellman } from "crypto"
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'
import speakeasy from "speakeasy";




const __filename = fileURLToPath(import.meta.url);
const saltRounds = 10
const __dirname = path.dirname(__filename);
var privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys/private.key'));
let r_key_timestmp = 1800000;  //20 minute


const rules = (request) => {
    if (request.side == 'reset_pwd') {
        return {
            'type':'required|in:email,mobile',
            'email': 'required_if:type,email',
            'mobile': 'required_if:type,mobile',
            
        }
    } else {
        return {
            'type':'required|in:email,mobile',
            'r_key':'required'
        }
    }
}


// for generate uer unique id
const generateUserUniqueId = async () => {
    let u_key = Math.floor(10000000 + Math.random() * 90000000)
    let exist = await User.findOne({ where: { user_unique_id: u_key }, attributes: ["id"] })
    if (exist) {
        return generateUserUniqueId()
    }
    return u_key;
}

const signup = async (req,res) =>{
    let data = req.body

    let {status,message} = await CValidator(data, {
        // name:'required|min:4|max:10',
        // type: 'required|in:email,mobile',
        // email: 'required_if:type,email|email',
        // mobile: 'required_if:type,mobile|digits_between:7,15',
        // password: 'required|password_regex|min:8',

        name:'required|min:4|max:10', 
        email: 'required',
        mobile: 'required|digits_between:7,15',
        password: 'required|password_regex|min:8',
    });

    if (!status) {
        return res.send(reply.failed(message));
    }
     

    //check if exist
    let check = await User.findOne({
        where:{
           email: data.email,
           mobile:data.mobile 
        }
    })

    if(check){
        return res.send(reply.failed(`${data.type} Already Exist`))
    }

   

    data = _.pick(data,['email','mobile','password','name'])

    data.user_unique_id = await generateUserUniqueId()

    //hashing password
    let result = bcrypt.hash(data.password, saltRounds, async function (err, hash) {
        if (err) return 0;
        data.password = hash;
        let user = await User.create(data);

         //update usermeta
         await UserMeta.create({ user_id: user.id }) 
       let chec=  await UserMeta.update({ is_email_authentication: data.email != undefined ? 1 : 0,is_mobile_authentication:data.mobile != undefined ? 1 : 0, }, { where: {  user_id : user.id } })
             
        if (!user) return 0;
        return res.send(reply.success("User Created Successfully"));
    });

    if (result == 0) {
        return res.send(reply.failed("Unable to create user at this time."));
    }
}

const is_valid = async(req,res) =>{
    let request = req.body

    let { status, message } = await CValidator(request, {
        'side': 'required|in:reset_pwd,login',
        'type': 'required|in:email,mobile',
        'value': 'required',
    })

   if(!status){
        return res.send(reply.failed(message))
   }

   try {
    // let user = await User.findOne({
    //     where: 
    //         {[Op.or]:[{email:username},{mobile:username}]
    //     },attributes:['email','mobile']
    // })

    let user = await User.findOne({
        where: 
            {[request.type]:request.value
        },attributes:['id','email','mobile']
    })

    if(!user){
        return res.send(reply.failed('User not found'))
    }


    return res.send(reply.success('Verified',user,{type:request.type,side:request.side}))
   } catch (error) {
        return res.send(reply.failed('Failed to Verify at this moment!!'))
   }
}

const login = async(req,res) =>{
    let request = req.body

    let {status, message} = await CValidator(request,{
        // 'email':'required|email|exists:users,email',
        'type':'required|in:email,mobile',
        'value':'required',
        'password':'required'
    })

    if(!status){
        return res.send(reply.failed(message))
    }
 
    try {
        let user = await User.findOne({
            where: {
                [request.type]: request.value,
            },
            attributes: ["id", "email", "password"],
            include: [{ model: UserMeta, as: "meta", attributes: ["is_email_authentication", "is_mobile_authentication", "is_google_authentication", "expired_at", ] 
        }
      
    ]
    
        });  
        let { id, email, password } = user;
       

        if (!user) {
            return res.json(reply.failed('User not Found!!'));
        }

        let hash = password.replace(/^\$2y(.+)$/i, '$2a$1');

        let compare_pwd = await bcrypt.compare(request.password, hash);

        if (!compare_pwd) {
            return res.json(reply.failed("Invalid Credentials!!"));
        }  
        let { is_email_authentication, is_mobile_authentication, is_google_authentication, r_key, expired_at } = user.meta;
      

        let v = true; // stands for verification

        if (is_email_authentication == 0 && is_mobile_authentication == 0 && is_google_authentication == 0) {
            let t_id = crypto.randomBytes(40).toString('hex');
            
            //Destroy token if already exist
            await Token.destroy({ where: { user_id: id  } }) 

            await Token.create({
                id: t_id,
                user_id: id,
                client_id: '1',
                name: email
            });

            v = false;

            let token = jwt.sign({ jti: t_id }, privateKey, { algorithm: 'RS256', expiresIn: '1d' });

            return res.json(reply.success('Login Success', { token, v }));
        }

        r_key = crypto.randomBytes(64).toString('hex');
        expired_at = Date.now() + r_key_timestmp

        // r_key = btoa(r_key);
        await UserMeta.update({ r_key, expired_at }, {
            where: {
                user_id: id
            }
        });

        let vm = {}; // stands for verification mode
        vm.email = (is_email_authentication != 0) ?  true : false;
        vm.mobile = (is_mobile_authentication != 0) ? true : false;
        vm.two_factor = (is_google_authentication != 0) ? true : false;
        return res.send(reply.success('Verification Pending', { v, vm, r_key: btoa(r_key) }));


    } catch (error) {
        console.log({error})
    }

  

}

const get_code = async(req,res) =>{
    let request = req.body

    if(!request.side){
        return res.send(reply.failed('Request side is required'))
    }

    let {status,message} = await CValidator(request,rules(request))

    if(!status){
        return res.send(reply.failed(message))
    }

    var user_id=''
    var email=''

    if (request.side == 'reset_pwd') {
        let column = request.type == 'email' ? request.email : request.mobile
       

        let userData = await User.findOne({where:{[request.type]:column}})
        if(!userData){
            return res.send(reply.failed('Wrong Details,No user found'))
        }
        user_id = userData.id
        email = userData.email
        // return res.json({userData})
    }else{
        let key = atob(request.r_key);

        let userMetaData = await UserMeta.findOne({
            where:{
                r_key:key
            },
            attributes:['user_id','r_key','expired_at'],

            include: [
                { model: User, required: true,attributes:['email','mobile'] }
            ],
        })

        if(!userMetaData){
            return res.send(reply.failed('User details not found with these details.Please Login from Start'))
        }

        if(userMetaData.expired_at < Date.now()){
            return res.json({status_code: "0", message: "key expired.Please Login from Start", r_key: 'expired' });
        }

        user_id = userMetaData.user_id
        email = userMetaData.user.email
    }

 

    
    var otp = Math.floor(100000 + Math.random() * 900000)

    if (request.type == "email") {
        let details = await Helper.create_otp("login", otp, user_id, request.type, email)
        if (!details.resStatus) {
            return res.send(reply.failed(details.msg));
        }

        let mailContent = await Helper.getTemplateContent('email', 'login');
        let mailContentSend = mailContent.replace(variables.mail_dynamic_content, otp);
        let a = await Mail.send(email, mailContentSend);
        if (!a) {
            return res.send(reply.failed('Unable to send code at this time!!'));
        }
        return res.send(reply.success('Mail has successfully sent', { expired_at: details.expired_at }));
    }


    //================== MOBILE INTEGRATION PENDING =========================//
    if (request.type == "mobile") {

        let email='raja@yopmail.com'  //static email for sms remove after sms package implementation

        let details = await Helper.create_otp("login", otp, user_id, request.type, email)
        if (!details.resStatus) {
            return res.send(reply.failed(details.msg));

        }
        let mailContent = await Helper.getTemplateContent('mobile', 'login');
        let mailContentSend = mailContent.replace(variables.mail_dynamic_content, otp);
        let a = await Mail.send(email, mailContentSend);
        if (!a) {
            return res.send(reply.failed('Unable to send code at this time!!'));
        }
        return res.send(reply.success('Mail has successfully sent', { expired_at: details.expired_at }));
    }
}

const set_googleauth = async(req,res) =>{

    let user = req.user
 
    let exist_user = await UserMeta.findOne({ where: { user_id: user?.id } });

    // return res.json({exist_user})
    if (exist_user && exist_user?.is_google_authentication == 0) {

        let secret_key = speakeasy.generateSecret({ length: 10 });
        exist_user['gauth_secret'] = secret_key?.base32;
        exist_user.save();
        return res.json(reply.success("Google Auth Secret Created Successfully", secret_key?.base32));
    }
    return res.json(reply.failed("Google Authentication Key Already generated"));
}

const google_auth_verfiy = async(req,res) =>{
    let request = req.body
    let user = req?.user;

    let { status, message } = await CValidator(request, {
        'totp': 'required|min:6|max:6'
    });

    if (!status) {
        return res.send(reply.failed(message));
    }

    let exist_user = await UserMeta.findOne({ where: { user_id: user?.id } });
  
    if (!exist_user) {
        return res.json(reply.failed("User Not found."));
    }

    // Verify a given token
    const verified = speakeasy.totp.verify({
        secret: exist_user?.gauth_secret,
        encoding: 'base32',
        token: request?.totp,
    }); // Return

    if (verified) {
        exist_user["is_google_authentication"] = 1;
        exist_user.save();
        return res.json(reply.success("Google Authenticator Setup Verified Successfully"))
    } else {
        return res.json(reply.failed("Incorrect TOTP Provided"))
    }
}

const verify_otp = async(req,res) =>{
    let request = req.body

    if (typeof request.otps !== "object") {
        return res.send(reply.failed("Invalid Data Type for otps"));
    }

    let { status, message } = await CValidator(request, {
        r_key: "required",
        otps: {
            email:'string',
            mobile:'string',
            totp:'string'
        },
    });
    if (!status) {
        return res.send(reply.failed(message));
    }

    //===Get user and usermeta details===//

    let key = atob(request.r_key);
    let userMetaData = await UserMeta.findOne({
        where:{
            r_key:key
        },

        include: [
            { model: User, required: true }
          ],
    }) 

    if(userMetaData.expired_at < Date.now()){
        return res.json({status_code: "0", message: "key expired.Please Login from Start", r_key: 'expired' });
    }

    

    // Mobile Otp verification
    if (userMetaData.is_mobile_authentication) {
        if (!request.otps["mobile"]) {
            return res.send(reply.failed("Invalid Mobile Data"));
        }
        let details = await Helper.verify("mobile",request.otps["mobile"], userMetaData.user_id);

        if (!details.status) {
            return res.send(reply.failed(details.message));
        }

         // verify
         if (userMetaData.mobile_verified_at == null) {
            userMetaData.mobile_verified_at = Date.now();
            await userMetaData.save();
        }
    }

    // Email Otp verification
    if (userMetaData.is_email_authentication) {
        if (!request.otps["email"]) {
            return res.send(reply.failed("Invalid email Data"));
        }
        let details = await Helper.verify("email", request.otps["email"], userMetaData.user_id);
        if (!details.status) {
            return res.send(reply.failed(details.message));
        }

        // verify
        if (userMetaData.email_verified_at == null) {
            userMetaData.email_verified_at = Date.now();
            await userMetaData.save();
        }
    }

    //Gauth Verification
    if (userMetaData.is_google_authentication) {
        if (!request.otps["totp"]) {
            return res.send(reply.failed("Invalid GoogleAuth Data"));
        }
       

        const verified = speakeasy.totp.verify({
            secret: userMetaData?.gauth_secret,
            encoding: 'base32', 
            token: request.otps["totp"],
        });   
     
       
        if (!verified) {
        return res.send(reply.failed('Incorrect TOTP Provided'))
        }
    }

    //verify

    // return res.json({userMetaData})

    let t_id = crypto.randomBytes(40).toString("hex");

    await Token.create({
        id: t_id,
        user_id: userMetaData.user.id,  
        client_id: "1",
        name: userMetaData.user.email,
    });
   
    
    var token = await jwt.sign(
        { jti: t_id },
        privateKey,
        { algorithm: "RS256" },
        { expiresIn: "1d" }
    );
    

    userMetaData.r_key = null;
    await userMetaData.save();

    let user ={
        'id': userMetaData.user.id,
        'email': userMetaData.user.email,  
        'name':userMetaData.user.name
         
    }
    console.log(user,"9090909");
    return res.json(
        reply.success("Login Success",{user},{token}
        )
    );
}

const logout = async(req,res) =>{
    let token_id = req.user.id
    try {
        //// Delete Refresh Token
        await Token.destroy({ where: { user_id: token_id } }) 
        return res.send(reply.success('Logout Successfully'))
    } catch (error) {
        console.log(error)
        return res.send(reply.failed('Unable to Logout'))
    }
}

const forgotPassword = async(req,res)=>{
    let request = req.body;

    let { status, message } = await CValidator(request, {
        'email': 'required|email|exists:users,email',
    });

    if (!status) {
        return res.send(reply.failed(message));
    }

    let user = await User.findOne({ where: { email: request.email } });
    let otp = Math.floor(100000 + Math.random() * 900000)

    let details = await Helper.create_otp("forgot", otp, user.id,"email",request.email)

    if (!details.resStatus) {
        return res.send(reply.failed(details.msg));

    }
    let mailContent = await Helper.getTemplateContent('email', 'forgot');


    let mailContentSend = mailContent.replace(variables.mail_dynamic_content, otp);


    let a = await Mail.send(user.email, mailContentSend);

    if (!a) {
        return res.send(reply.success('Unable to forgot at this time!!'));
    }

    return res.send(reply.success('Mail has successfully sent', { expired_at: details.expired_at }));
}

const resetPassword = async(req,res)=>{
    let request = req.body;

    let { status, message } = await CValidator(request, {
        'reset_type':'required|in:email,mobile',
        'email': 'required_if:reset_type,email|email',
        'mobile': 'required_if:reset_type,mobile',
        'new_password': 'required|min:8|max:18|password_regex',
        'confirm_password': 'required|same:new_password',
    });

    if (!status) {
        return res.send(reply.failed(message));
    }
    let column = request.reset_type == 'email' ? request.email : request.mobile
    let user = await User.findOne({ where: { [request.reset_type]: column } });
    let hash = user.password.replace(/^\$2y(.+)$/i, '$2a$1');


    //####### If old and new password is same
    let compare_new_pwd = await bcrypt.compare(request.new_password, hash);
    if (compare_new_pwd) {
        return res.json(reply.failed("old and new password should not be same!!"));
    }

    //#### Updated New password
    let hash_pwd = await bcrypt.hash(request.new_password, saltRounds);


    let update = await User.update({ password: hash_pwd }, { where: { id: user.id } })

    return (update ? res.send(reply.success('Password Sucessfully Changed')) : res.send(reply.failed('unable to change password at this time, Please try it later!')))
 
}

const password_verify_otp = async (req,res) => {
    let request = req.body

    if (typeof request.otps !== "object") {
        return res.send(reply.failed("Invalid Data Type for otps"));
    }

    let { status, message } = await CValidator(request, {
        type: "required",
        value: "required",
        otps: {
            email:'string',
            mobile:'string',
        },
    });

    if (!status) {
        return res.send(reply.failed(message));
    }



    //===Get user details===//
    let userData = await User.findOne({
        where:{
            [request.type]:request.value
        },
    })

    if(!userData){
        return res.send(reply.failed('User not found'));
    }


    // Email Otp verification
    if (request.type == 'email') {
        if(!request.otps["email"]){
            return res.send(reply.failed('Email Otp is Required'))
        }
        let details = await Helper.verify("email", request.otps["email"], userData.id);
        if (!details.status) {
            return res.send(reply.failed(details.message));
        }else{
            return res.send(reply.success(details.message)); 
        }
    }

     //  // Mobile Otp verification
     if (request.type == 'mobile') {
        if(!request.otps["mobile"]){
            return res.send(reply.failed('Mobile Otp is Required'))
        }
    
        let details = await Helper.verify("mobile",request.otps["mobile"], userData.id);

        if (!details.status) {
            return res.send(reply.failed(details.message));
        }else{
            return res.send(reply.success(details.message)); 
        }
    }
}



///login by admin

const login_by_admin = async(req,res) =>{
    let request = req.body
console.log(request,"=-=-=-");
    let {status, message} = await CValidator(request,{
        'email':'required|exists:users,email', 
        'password':'required'
    })

    if(!status){ 
        return res.send(reply.failed(message))
    }
 
    try {
        let user = await User.findOne({
            where: {
                role: 'admin',
            },
            attributes: ["id", "email", "password","role"],
            include: [{ model: UserMeta, as: "meta", attributes: ["is_email_authentication", "is_mobile_authentication", "is_google_authentication"] ,
            raw:true
        }
    ]
        }); 
         
        let { id, email, password ,role} = user; 
        if (role!='admin') {
            return res.json(reply.failed('User not Found!!'));
        }

        let hash = password.replace(/^\$2y(.+)$/i, '$2a$1');

        let compare_pwd = await bcrypt.compare(request.password, hash);

        if (!compare_pwd) {
            return res.json(reply.failed("Invalid Credentials!!"));
        }   
        let { is_email_authentication, is_mobile_authentication, is_google_authentication  } = user.meta;
      

        let v = true; // stands for verification 
        if (is_email_authentication == 0 && is_mobile_authentication == 0 && is_google_authentication == 0) {
            let t_id = crypto.randomBytes(40).toString('hex');
            
            //Destroy token if already exist
            await Token.destroy({ where: { user_id: id  } }) 

            await Token.create({
                id: t_id,
                user_id: id,
                client_id: '1',
                name: email
            });

            v = false;

            let token = jwt.sign({ jti: t_id }, privateKey, { algorithm: 'RS256', expiresIn: '1d' });

            return res.json(reply.success('Login Success', { token, v }));
        }




    } catch (error) {
        console.log({error})
    }

  

}

const update_profile= async (req, res) => {
    let data = req.body;
    let user = req.user 
    try {
        let { status, message } = await CValidator(data, {
            name: 'required|min:3|max:15',
            email: 'required',
            mobile: 'required|min:1|max:10',
            alternate_mobile:'required|min:1|max:10'
        });
        if (!status) {
            return res.send(reply.failed(message));
        }


       await User.update(
            { 
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                alternate_mobile:data.alternate_mobile
            }, {
            where: {
                id: user.id
            }
        })
        return res.json(reply.success('User Updated Successfully'));
    } catch (error) {
        console.log(error, "errorerror");
        return res.send(reply.failed('Failed to update  at this moment!!'))
    }
}


export default {
    login_by_admin,
    signup,
    is_valid,
    login,
    get_code,
    set_googleauth,
    google_auth_verfiy,
    verify_otp,
    logout,
    forgotPassword,
    resetPassword,
    password_verify_otp,
    update_profile
}