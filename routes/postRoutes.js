import express from "express";
import bcrypt from "bcrypt";
import { GetWeather } from "../data/weatherFunction.js";
import db from "../data/server.js";
import { getPosts } from "../data/dataFunctions.js";
import topics from "../data/topics.js";
import passport from "passport";

const postRouter = express.Router();
const saltRounds = 10;

//Send login data for authentification
postRouter.post("/login", passport.authenticate('local', {
    successRedirect: "/post",
    failureRedirect: "/",
}));

//Create new user in database
postRouter.post("/register", async (req, res) => {
    try {
        bcrypt.genSalt(saltRounds, async function (err, salt) {
            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                await db.query("INSERT INTO users(username, password, nickname, location) VALUES ($1,$2,$3,$4);",
                    [req.body.username, hash, req.body.nickname, req.body.location]);
            });
        });
        res.redirect("/");
    } catch (error) {
        console.log(error)
    }
});

//Send new post data to database
postRouter.post("/add", async (req, res) => {
    const topic = topics.find((topic) => topic.name == req.body.topic);
    try {
        await db.query("INSERT INTO posts(title, topic, color, userId, text) VALUES ($1,$2,$3,$4,$5);",
            [req.body.title, req.body.topic, topic.color, req.user.id, req.body.text]);

    } catch (error) {
        console.log(error);
    }
    res.redirect('/post');
});

//filter post on the homepage
postRouter.post("/filter", async (req, res) => {
    const topic = req.body.topic;
    var data;
    const weather = await GetWeather(req.user.location);
    try {
        if (topic == "All Posts") {
            data = await getPosts();
        }
        else if (topic == "My Posts") {
            const result = await db.query("SELECT * FROM posts WHERE userid=$1", [req.user.id]);
            data = result;
        }
        else if (topic == "Other People") {
            const result = await db.query("SELECT * FROM posts WHERE userid!=$1", [req.user.id]);
            data = result;
        }
        else {
            const result = await db.query("SELECT * FROM posts WHERE topic=$1", [topic]);
            data = result;
        }
    } catch (error) {
        console.log(error);
    }
    const selectedTopic = topic;
    res.render("index.ejs", {
        topics: topics,
        data: data,
        selectedTopic: selectedTopic,
        weather: weather,
        user: req.user.nickname
    });
});

//send data to update your post 
postRouter.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const topic = topics.find((topic) => topic.name == req.body.topic);
    try {
        await db.query("UPDATE posts SET title = ($1), text = ($2), topic = ($3), color = ($4) WHERE id = ($5)",
            [req.body.title, req.body.text, topic.name, topic.color, id]);
    } catch (error) {
        console.log(error);
    }
    res.redirect('/details/' + id);
});

export default postRouter;