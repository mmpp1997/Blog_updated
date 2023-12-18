import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./server.js";

const strategy = new LocalStrategy(
    (username, password, done) => {
        // Query the database to find the user
        db.oneOrNone('SELECT * FROM users WHERE username = $1;', [username])
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                // Compare hashed password
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return done(err);
                    }
                    if (!result) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }

                    // Successful login
                    return done(null, user);
                });
            })
            .catch(err => done(err));
    }
);
export default strategy;