import express from 'express'
import cors from 'cors';
import cookieSession from 'cookie-session';
import passport from 'passport';
import passportSetup from "./Passport.js"  
const port = 5000 

const app = express()
app.use(cors({

    origin:"http://localhost:5173",
    methods:"GET,POST,PUT,DELETE",
    credentials:true
}
))
app.use(express.json())
app.use(cookieSession({name:"session",keys:["lama"],maxAge:24*60*60*100}));


app.use(passport.initialize())
app.use(passport.session())


import { Authroutes } from './routes/Authroutes.js';
app.use('/user',Authroutes)

import { Auth } from './routes/Auth.js';
app.use("/auth",Auth);

app.listen(port,() =>{
    console.log(`app is listening on  ${port}` );
})