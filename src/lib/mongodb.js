import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function dbConnect() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to MongoDB');
    await client.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

dbConnect();
