import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

async function writeAccess(req, res, next) {
  const db = req.app.get('db');
  
  const user = await db.collection('user').findOne({ _id: res.locals?.oauth?.token?.user?.user_id });
  if (user?.permissions?.write) {
    res.locals.user = user; 
    next();
  } else {
    res.status(403).send();
  }
}

// Middleware to verify token and get user
const authenticateToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const db = req.app.get('db');
    const user = await db.collection('users').findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userProfile = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/todo', writeAccess, async (req, res) => {
  try {
    const db = req.app.get('db');
    const insertion = await db.collection('todo').insertOne({
      ...req.body,
      creator_id: res.locals.user._id,
    });

    if (insertion.acknowledged) {
      const todo = await db.collection('todo').findOne({ _id: insertion.insertedId });

      if (todo) {
        res.status(201).json(todo);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(500).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

// Get user profile
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    res.json(req.userProfile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = req.app.get('db');
    const user = await db.collection('users').findOne({ 
      username: req.user.username,
      active: true
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return only necessary user information
    const userProfile = {
      username: user.username,
      email: user.email
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const db = req.app.get('db');
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Benutzer nach ID frgn
router.get('/user/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    
    if (user) {
      res.json(user); 
    } else {
      res.status(404).send(); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Benutzer erstellen
router.post('/user', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send("Missing required fields");
    }

    const db = req.app.get('db');
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    const insertion = await db.collection('users').insertOne(req.body); 
    if (insertion.acknowledged) {
      const user = await db.collection('users').findOne({ _id: insertion.insertedId }); 
      res.status(201).json(user);
    } else {
      res.status(500).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Benutzer akt
router.put('/user/:id', async (req, res) => {
    try {
        const db = req.app.get('db'); 
        const updateData = req.body;
        delete updateData._id;
        
        const updated = await db.collection('users')
            .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });
        
        
        if (updated.modifiedCount === 1) {
          const toDo = await db.collection('users')
            .findOne({ _id: new ObjectId(req.params.id) });
          if (toDo) {
            res.json(toDo);
          } else {
            res.status(404).send();
          }
        } else {
          res.status(404).send();
        }
      } catch(err) {
        console.error(err);
        res.status(500).send();
      }
});

// Benutzer löschen
router.delete('/user/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 1) {
      res.send();
    } else {
      res.status(404).send();
    }
  } catch(err) {
  console.error(err);
  res.status(500).send();
}
});

export default router;
