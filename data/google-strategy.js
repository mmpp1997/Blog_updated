import 'dotenv/config';
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import bcrypt from "bcrypt";
import db from "./server.js";

const google = new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/blog",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
);

export default google;