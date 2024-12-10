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


// Alle Benutzer abrufen
router.get('/user', async (req, res) => {
    try {
      const db = req.app.get('db'); 
      const users = await db.collection('users').find({}).toArray();
      res.json(users); 

    } catch (err) {
      console.error(err);
      res.status(500).send(); 
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
    
    if (deleted.deletedCount === 1) {
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
