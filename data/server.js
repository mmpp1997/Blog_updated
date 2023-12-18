import 'dotenv/config'
import pgPromise from 'pg-promise';


const pgp = pgPromise();
const db = pgp('postgres://postgres:' + process.env.PASSWORD + '@localhost:5432/Blog');

export default db;