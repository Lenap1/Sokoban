import express from 'express';
import { MongoClient } from 'mongodb';
import OAuthServer from 'express-oauth-server';
import dotenv from 'dotenv';
import api from './routes/api.js';
import register from './register.js';
import oAuthModel from './oAuthModel.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



try {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('sokoban');

  app.set('db', db);

  db.collection('token').createIndex({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
  db.collection('token').createIndex({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
  db.collection('token').createIndex({ emailTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

  const oauth = new OAuthServer({ model: oAuthModel(db) }); 

  app.use('/test', (req, res) => {
  res.send('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
})

  // backend routes
  app.use('/api/token', oauth.token({ requireClientAuthentication: { password: false, refresh_token: false } })); // use oauth token middleware
  app.use('/api/register', register); 
  app.use('/api', oauth.authenticate(), api); 

  // start server
  app.listen(port, () => {
    console.log('Example app listening on port ${port}');
  });
} catch (err) {
  console.error(err);
}



