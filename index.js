//community modules 
import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
//my imports 
import strategy from './data/local-strategy.js';
import google from './data/google-strategy.js';
import getRouter from './routes/getRoutes.js';
import postRouter from './routes/postRoutes.js';
import db from './data/server.js';

const port = 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(strategy);
passport.use(google);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.oneOrNone('SELECT * FROM users WHERE id = $1', [id])
    .then(user => done(null, user))
    .catch(err => done(err));
});


app.use("/", getRouter);
app.use("/", postRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});