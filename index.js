import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Blog",
  password: process.env.PASSWORD,
  port: 5432,
});
db.connect();

var selectedTopic="All Posts";
var topics=[
  {name:"General",color:"orange"},
  {name:"Drama",color:"blue"},
  {name:"Sports",color:"red"},
  {name:"Movies",color:"yellow"},
  {name:"Other",color:"grey"}
]
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function getPosts() {
  const posts=[];
  const result = await db.query("SELECT posts.*,users.nickname FROM users INNER JOIN posts ON users.id=posts.userId ORDER BY id ASC;");
  result.rows.forEach(row => {
    posts.push(row);
  });
  return posts;
}

app.get("/", async(req, res) => {
  selectedTopic="All Posts";
  res.render("index.ejs",{
    data: await getPosts(),
    topics:topics,
    selectedTopic:selectedTopic
});
});
app.get("/form", (req, res) => {
  res.render("form.ejs",{
    topics:topics,
    task:"POST"
  });
});
app.get("/details/:id", async(req, res) => {
  const id= req.params.id;
  const result = await db.query("SELECT * FROM posts WHERE id=$1",[id]);
  const data=result.rows[0];
  res.render("details.ejs",{
    about:data
  });
});
app.get("/delete/:id", async(req, res) => {
  const id= req.params.id;
  await db.query("DELETE FROM posts WHERE id=$1;",[id]);
  res.redirect("/");
});

app.get("/edit/:id", async(req, res) => {
  const id= req.params.id;
  const result = await db.query("SELECT id, title, text, topic, userid FROM posts WHERE id=$1",[id])
  const data=result.rows[0];
  res.render("form.ejs",{
    data:data,
    task:"EDIT",
    topics:topics
  });
});
app.post("/filter", async(req, res) => {
  const topic= req.body.topic;
  var data;
  if(topic=="All Posts"){
    data=await getPosts();
  }
  else{
    const result = await db.query("SELECT * FROM posts WHERE topic=$1",[topic]);
    data=result.rows;
  }
  selectedTopic=topic;
  res.render("index.ejs",{
    topics:topics,
    data:data,
    selectedTopic:selectedTopic
  });
});

app.post("/form", async(req, res) => {
  const topic=topics.find((topic)=>topic.name==req.body.topic);
  await db.query("INSERT INTO posts(title, topic, color, userId, text) VALUES ($1,$2,$3,$4,$5);",
  [req.body.title,req.body.topic,topic.color,1,req.body.text]);
  res.redirect('/');
});

app.post("/edit/:id", async(req, res) => {
  const id= req.params.id;
  const topic=topics.find((topic)=>topic.name==req.body.topic);
  await db.query("UPDATE posts SET title = ($1), text = ($2), topic = ($3), color = ($4) WHERE id = ($5)",
  [req.body.title, req.body.text, topic.name, topic.color, id]);
  res.redirect('/details/'+id);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
