import express from "express";
import db from "../data/server.js";
import { GetWeather } from "../data/weatherFunction.js";
import { getPosts, GetPostData } from "../data/dataFunctions.js";
import topics from "../data/topics.js";

const getRouter = express.Router();

//Get login page
getRouter.get("/", async (req, res) => {
  res.render("login.ejs", {
    task: "login"
  });
});

//Get register page
getRouter.get("/reg", async (req, res) => {
  res.render("login.ejs", {
    task: "register"
  });
});

//Get posts page or homepage
getRouter.get("/post", async (req, res) => {
  if (req.isAuthenticated()) {
    const weather = await GetWeather(req.user.location);
    const selectedTopic = "All Posts";
    res.render("index.ejs", {
      data: await getPosts(),
      topics: topics,
      selectedTopic: selectedTopic,
      weather: weather,
      user: req.user.nickname
    });
  } else {
    res.redirect("/");
  }
});

//Get new post page
getRouter.get("/form", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("form.ejs", {
      topics: topics,
      task: "POST",
      user: req.user.nickname
    });
  } else {
    res.redirect("/");
  }
});

//Get post details page
getRouter.get("/details/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    const weather = await GetWeather(req.user.location);
    var data;
    try {
      data = await GetPostData(id);
    } catch (error) {
      console.log(error)
    }
    var isAuthor = false;
    if (data.nickname == req.user.nickname) {
      isAuthor = true;
    }
    res.render("details.ejs", {
      about: data,
      weather: weather,
      user: req.user.nickname,
      isAuthor: isAuthor
    });
  } else {
    res.redirect("/");
  }
});

//Get edit post page
getRouter.get("/edit/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    var data;
    try {
      data = await GetPostData(id);
    } catch (error) {
      console.log(error)
    }
    res.render("form.ejs", {
      data: data,
      task: "EDIT",
      topics: topics,
      user: data.nickname
    });
  } else {
    res.redirect("/");
  }
});

//delete post from database
getRouter.get("/delete/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    try {
      await db.query("DELETE FROM posts WHERE id=$1;", [id]);
    } catch (error) {
      console.log(error)
    }
    res.redirect("/post");
  } else {
    res.redirect("/");
  }
});

//logout from site
getRouter.get('/logout', function (req, res, next) {
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

export default getRouter;