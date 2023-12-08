import express from "express";
import bodyParser from "body-parser";
//soon to be updated 


const app = express();
const port = 3000;
var posts=[];
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

app.get("/", (req, res) => {
  selectedTopic="All Posts";
  res.render("index.ejs",{
    data: posts,
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
app.get("/details/:id", (req, res) => {
  const id= req.params.id;
  const postIndex=posts.findIndex((post)=>post.id==id);
  res.render("details.ejs",{
    about:posts[postIndex]
  });
});
app.get("/delete/:id", (req, res) => {
  const id= req.params.id;
  const postIndex=posts.findIndex((post)=>post.id==id);
  posts.splice(postIndex,1)
  res.redirect("/");
});
app.get("/edit/:id", (req, res) => {
  const id= req.params.id;
  const postIndex=posts.findIndex((post)=>post.id==id);
  res.render("form.ejs",{
    data:posts[postIndex],
    task:"EDIT",
    topics:topics
  });
});
app.post("/filter", (req, res) => {
  const topic= req.body.topic;
  var data;
  if(topic=="All Posts"){
    data=posts;
  }
  else{
    data=posts.filter((post)=>post.topic==topic);
  }
  selectedTopic=topic;
  res.render("index.ejs",{
    topics:topics,
    data:data,
    selectedTopic:selectedTopic
  });
});

app.post("/form", (req, res) => {
  var id=Math.floor(Math.random()*10000);
  for(i=0;i<posts.length;i++){
    if(id==posts[i].id){
      id=Math.floor(Math.random()*10000);
      i=0;
    }
  };
  const topic=topics.find((topic)=>topic.name==req.body.topic);
  var post={
    id:id,
    title:req.body["title"],
    name:req.body["name"],
    topic:req.body["topic"],
    color:topic.color,
    text:req.body["text"]};
  posts.push(post);
  res.redirect('/');
});

app.post("/edit/:id", (req, res) => {
  const id= req.params.id;
  const postIndex=posts.findIndex((post)=>post.id==id);
  if(posts[postIndex].title!=req.body.title){
    posts[postIndex].title=req.body.title;
  }
  if(posts[postIndex].name!=req.body.name){
    posts[postIndex].name=req.body.name;
  }
  if(posts[postIndex].text!=req.body.text){
    posts[postIndex].text=req.body.text;
  }
  if(posts[postIndex].topic!=req.body.topic){
    posts[postIndex].topic=req.body.topic;
    const topic=topics.find((topic)=>topic.name==req.body.topic);
    posts[postIndex].color=topic.color;
  }
  res.redirect('/details/'+posts[postIndex].id);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
