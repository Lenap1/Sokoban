import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import api from './routes/api.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', api);
app.use('', (req, res) => {
  res.send('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
})

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
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
