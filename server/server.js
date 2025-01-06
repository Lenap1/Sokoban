import express from 'express';
import { MongoClient } from 'mongodb';
import OAuthServer from 'express-oauth-server';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import api from './routes/api.js';
import register from './register.js';
import oAuthModel from './oAuthModel.js';
import highscoreRoutes from './routes/highscore.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const port = 3000;

// CORS 
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

try {
  const client = new MongoClient(mongoUri.toString());
  await client.connect();
  const db = client.db('sokoban');

  app.set('db', db);

  db.collection('token').createIndex({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
  db.collection('token').createIndex({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
  db.collection('token').createIndex({ emailTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

  // Registrierungsroute vor OAuth
  app.use('/api/user/register', register);

  // OAuth Setup
  const oauth = new OAuthServer({ 
    model: oAuthModel(db),
    accessTokenLifetime: 3600, // 1 h
    refreshTokenLifetime: 7 * 24 * 3600, // 7 t
    allowBearerTokensInQueryString: true,
    allowEmptyState: true,
    authenticateHandler: {
      handle: async (req, res) => {
        const token = req.get('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
          return null;
        }
        
        const accessToken = token.split(' ')[1];
        const tokenDoc = await db.collection('token').findOne({ accessToken });
        
        if (!tokenDoc) {
          return null;
        }

        if (tokenDoc.accessTokenExpiresAt < new Date()) {
          await db.collection('token').deleteOne({ accessToken });
          return null;
        }

        return tokenDoc.user;
      }
    }
  }); 

  app.oauth = oauth;

  // Middleware 
  const authenticateRequest = async (req, res, next) => {
    try {
      const token = req.get('Authorization');
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const accessToken = token.split(' ')[1];
      const tokenDoc = await db.collection('token').findOne({ accessToken });
      
      if (!tokenDoc) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (tokenDoc.accessTokenExpiresAt < new Date()) {
        await db.collection('token').deleteOne({ accessToken });
        return res.status(401).json({ error: 'Token expired' });
      }

      req.user = tokenDoc.user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  app.use('/test', (req, res) => {
    res.send('Sokoban mid Jas und Lena, Kollegen. Viel Spass!');
  });

  app.post('/api/token', oauth.token({
    requireClientAuthentication: {
      password: false,
      refresh_token: false
    }
  }));

  // OAuth geschützte Routen
  app.use('/api/user', authenticateRequest, api);
  app.use('/highscore', authenticateRequest, highscoreRoutes);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
