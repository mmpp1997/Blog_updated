import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import passport from "passport";
import session from "express-session";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy }  from "passport-local";
import connectPgSimple from "connect-pg-simple";
import pgPromise from 'pg-promise';
import pg from "pg";

const pgSession = connectPgSimple(session);
const pgp = pgPromise();
const saltRounds = 10;
const app = express();
const port = 3000;
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const db = pgp('postgres://postgres:'+process.env.PASSWORD+'@localhost:5432/Blog');

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
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
));

// Serialize and deserialize user

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.oneOrNone('SELECT * FROM users WHERE id = $1', [id])
    .then(user => done(null, user))
    .catch(err => done(err));
});


var selectedTopic="All Posts";
var topics=[
  {name:"General",color:"orange"},
  {name:"Drama",color:"blue"},
  {name:"Sports",color:"red"},
  {name:"Movies",color:"yellow"},
  {name:"Other",color:"grey"}
]

async function getPosts() {
  const posts=[];
  try {
    const result = await db.query("SELECT posts.*,users.nickname FROM users INNER JOIN posts ON users.id=posts.userId ORDER BY id ASC;");
    result.forEach(row => {
    posts.push(row);
    });
  } catch (error) {
    console.log(error);
  }
  return posts;
}
async function GetPostData(id) {
  const result = await db.query("SELECT posts.*, users.nickname, users.username FROM posts"+
  " INNER JOIN users ON posts.userid=users.id WHERE posts.id=$1;",[id]);
  return result[0];
}

async function GetWeather(location){
  var data;
  try {
    const response = await axios.get("http://api.weatherapi.com/v1/current.json?",
    { params: {key: process.env.API_KEY,q:location}});
    const city=response.data.location.name;
    const temperature=response.data.current.temp_c;
    const forecast=response.data.current.condition.text;
    const text=city+": "+forecast+", "+temperature+"°C";
    const image=response.data.current.condition.icon;
    data={text:text,image:image};
  } catch (error) {
    console.log(error);
  }
  return data;
}

app.get("/", async(req, res) => {
  res.render("login.ejs",{
    task:"login"
});
});

app.get("/reg", async(req, res) => {
  res.render("login.ejs",{
    task:"register"
});
});


app.post ("/login", passport.authenticate('local', {
  successRedirect: "/post",
  failureRedirect: "/",
}))

app.post("/register", async(req, res) => {
  try{
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        db.query("INSERT INTO users(username, password, nickname, location) VALUES ($1,$2,$3,$4);",
        [req.body.username, hash, req.body.nickname, req.body.location]);
      });
    });
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.get("/post", async(req, res) => {
  if (req.isAuthenticated()){
    console.log(req.user);
    const weather= await GetWeather(req.user.location);
    selectedTopic="All Posts";
    res.render("index.ejs",{
      data: await getPosts(),
      topics:topics,
      selectedTopic:selectedTopic,
      weather:weather,
      user:req.user.nickname
    });
  }else{
    res.redirect("/");
  }
});
app.get("/form", (req, res) => {
  res.render("form.ejs",{
    topics:topics,
    task:"POST"
  });
});
app.get("/details/:id", async(req, res) => {
  const id= req.params.id;
  const weather= await GetWeather();
  var data;
  try {
    data=await GetPostData(id);
  } catch (error) {
    console.log(error)
  }
  res.render("details.ejs",{
    about:data,
    weather:weather
  });
});
app.get("/delete/:id", async(req, res) => {
  const id= req.params.id;
  try {
    await db.query("DELETE FROM posts WHERE id=$1;",[id]);
  } catch (error) {
    console.log(error)
  }
  res.redirect("/post");
});

app.get("/edit/:id", async(req, res) => {
  const id= req.params.id;
  var data;
  try {
    data=await GetPostData(id);
  } catch (error) {
    console.log(error)
  }
  res.render("form.ejs",{
    data:data,
    task:"EDIT",
    topics:topics
  });
});
app.post("/filter", async(req, res) => {
  const topic= req.body.topic;
  var data;
  const weather= await GetWeather();
  try {
    if(topic=="All Posts"){
      data=await getPosts();
    }
    else{
      const result = await db.query("SELECT * FROM posts WHERE topic=$1",[topic]);
      data=result;
    }
  } catch (error) {
    console.log(error);
  }
  selectedTopic=topic;
  res.render("index.ejs",{
    topics:topics,
    data:data,
    selectedTopic:selectedTopic,
    weather:weather
  });
});

app.post("/add", async(req, res) => {
  const topic=topics.find((topic)=>topic.name==req.body.topic);
  try {
    await db.query("INSERT INTO posts(title, topic, color, userId, text) VALUES ($1,$2,$3,$4,$5);",
    [req.body.title,req.body.topic,topic.color,1,req.body.text]);
    
  } catch (error) {
    console.log(error);
  }
  res.redirect('/post');
});

app.post("/edit/:id", async(req, res) => {
  const id= req.params.id;
  const topic=topics.find((topic)=>topic.name==req.body.topic);
  try {
    await db.query("UPDATE posts SET title = ($1), text = ($2), topic = ($3), color = ($4) WHERE id = ($5)",
    [req.body.title, req.body.text, topic.name, topic.color, id]);
  } catch (error) {
    console.log(error);
  }
  res.redirect('/details/'+id);
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
