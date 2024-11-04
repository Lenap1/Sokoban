import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import api from './api.js';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

const connectionString = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());
app.use('/api', api);

async function startServer() {
  try {
    const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db('demo');
    app.set('db', db); 
    app.listen(port, () => {
      console.log(`Server läuft auf Port ${port}`);
    });
  } catch (err) {
    console.error('Fehler beim Verbinden mit MongoDB:', err);
    process.exit(1); 
  }
}

startServer();
