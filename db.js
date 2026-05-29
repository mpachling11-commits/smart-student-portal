const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "student_placement_portal";

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);

  console.log(`MongoDB connected: ${dbName}`);
  return db;
}

async function closeDB() {
  if (!client) return;

  await client.close();
  client = null;
  db = null;
}

module.exports = {
  connectDB,
  closeDB,
  dbName,
  mongoUri
};
