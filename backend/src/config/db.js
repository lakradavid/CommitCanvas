import { MongoClient } from 'mongodb';
const client = new MongoClient("mongodb+srv://aloksharma1097_db_user:A4o7qGY9Ow10NINi@commitcanvas.vm7gp2a.mongodb.net/?appName=commitcanvas");
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}