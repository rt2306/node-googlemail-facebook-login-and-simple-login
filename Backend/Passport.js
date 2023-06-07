import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import {Strategy as FacebookStrategy } from 'passport-facebook'

const GOOGLE_CLIENT_ID="967150007316-6qb0aqirnkca5ompnn4t09fe2s3u0c03.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

const FACEBOOK_APP_ID = "1009957006659685";
const FACEBOOK_APP_SECRET = "1a6c2cd23a650846dff9dfb69f83e0fa"


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   
  if (profile.emails && profile.emails.length > 0) {
    console.log('Email: ' + profile.emails[0].value);
  } else {
    console.log('Email not provided');
  }
    done(null,profile)
    
  }
));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) { 
    done(null,profile)
    
  }
));

passport.serializeUser((user,done)=>{
    done(null,user)
})


passport.deserializeUser((user,done)=>{
    done(null,user)
})
 export default {}