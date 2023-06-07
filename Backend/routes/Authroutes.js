import express  from "express";
import UserController from "../Controllers/UserController.js"
import Authenticate from "../Middleware/Authenticate.js";

const router = express.Router()

router.post('/signup',UserController.signup)
router.post('/is_valid',UserController.is_valid)
router.post('/login',UserController.login)
router.post("/get_code" ,UserController.get_code);

router.post("/set_gauth" ,Authenticate, UserController.set_googleauth);
router.post("/gauth_verify" ,Authenticate, UserController.google_auth_verfiy);
router.post("/verify_otp" , UserController.verify_otp)

router.delete("/logout" , Authenticate,UserController.logout);
router.post("/forgot" ,UserController.forgotPassword);

router.post("/password_verify_otp" ,UserController.password_verify_otp);
router.post("/reset" ,UserController.resetPassword);
router.post("/update_profile" ,UserController.update_profile);



//admin api 

router.post("/login_by_admin" ,UserController.login_by_admin);







export const Authroutes = router