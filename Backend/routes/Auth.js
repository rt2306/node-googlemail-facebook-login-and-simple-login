import express  from "express";
import Passport from "../Passport.js";
import passport from "passport"; 

const router = express.Router()

const CLIENT_URL = "http://localhost:5173/"
 
router.get("/login/success",(req,res)=>{
    if(req.user){ 
        res.status(200).json({success:true,message:"success",user:req.user,
    })
    }
})

router.get("/login/failed",(req,res)=>{
    res.status(401).json({success:false,message:"failure"})
})

router.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect(CLIENT_URL);

})

router.get('/google',passport.authenticate("google",{ scope:["profile"]}));
router.get('/google/callback',passport.authenticate("google",{ successRedirect:CLIENT_URL,
failureRedirect:"/login/failed"}));

router.get('/facebook',passport.authenticate("facebook",{ scope:["profile"]}));
router.get('/facebook/callback',passport.authenticate("facebook",{ successRedirect:CLIENT_URL,
failureRedirect:"/login/failed"}));


export const Auth = router