import db from "./server.js";

async function getPosts() {
  const posts = [];
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
  const result = await db.query("SELECT posts.*, users.nickname, users.username FROM posts" +
    " INNER JOIN users ON posts.userid=users.id WHERE posts.id=$1;", [id]);
  return result[0];
}
export { getPosts, GetPostData };