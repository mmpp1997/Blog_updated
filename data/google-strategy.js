import 'dotenv/config';
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import db from "./server.js";

const google = new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/blog",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            let user = {};
            const currentuser = await db.query('SELECT * FROM users WHERE username = $1;', [profile.id]);
            if (currentuser.length>0) {
                user = {
                    id: parseInt(currentuser[0].id),
                    username: parseInt(currentuser[0].username),
                    nickname: currentuser[0].nickname
                };

            } else {
                const newUser = await db.query("INSERT INTO users(username, nickname, location) VALUES ($1,$2,$3) RETURNING id, username, nickname;",
                [profile.id, profile.displayName, "London"]);
                user = {
                    id: newUser[0].id,
                    username: newUser[0].username,
                    nickname: newUser[0].nickname
                };
            };
            console.log(user);
            done(null, user);
        } catch (error) {
            done(error, false, error.message)
        }
    }

);

export default google;