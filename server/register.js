import express from 'express';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';

const router = express.Router();

// E-Mail Validierung
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Passwort Validierung
const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
};

router.post('/', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { email, password } = req.body;

        // Validiere E-Mail
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
        }

        // Validiere Passwort
        if (!password || !validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben und Zahlen enthalten' 
            });
        }

        // Prüfe ob Benutzer bereits existiert
        const existingUser = await db.collection('user_auth').findOne({ username: email });
        if (existingUser) {
            return res.status(409).json({ error: 'E-Mail bereits registriert' });
        }

        // Erstelle neuen Benutzer
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertion = await db.collection('user_auth').insertOne({ 
            username: email,
            password: hashedPassword,
            created_at: new Date(),
            active: false
        });

        if (insertion.acknowledged) {
            const token = v4();
            const tokenInsertion = await db.collection('token').insertOne({
                emailToken: token,
                emailTokenExpiresAt: new Date(Date.now() + (1000 * 60 * 60)), // 1 Stunde
                user_id: insertion.insertedId,
                type: 'activation'
            });

            if (tokenInsertion.acknowledged) {
                // Hier könnte später E-Mail-Versand implementiert werden
                console.log(`Aktivierungslink: http://localhost:3000/activate/${token}`);
                return res.status(201).json({ 
                    message: 'Registrierung erfolgreich. Bitte aktivieren Sie Ihren Account.' 
                });
            }
        }
        
        throw new Error('Fehler bei der Registrierung');
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Interner Server-Fehler' });
    }
});

router.put('/:token', async (req, res) => {
    try {
        const db = req.app.get('db');
        
        const token = await db.collection('token').findOne({ emailToken: req.params.token });
        if (token) {
          const insertion = await db.collection('user').insertOne({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            permissions: { write: false },
          });
          if (insertion.acknowledged) {
            const updated = await db.collection('user_auth').updateOne({ _id: token.user_id }, { $set: {
              password: await bcrypt.hash(req.body.password, 10),
              user_id: insertion.insertedId
            } });
            if (updated.modifiedCount === 1) {
              await db.collection('token').deleteOne({ emailToken: req.params.token });
              res.status(200).send();
        } else {
          res.status(500).send();
        }
      } else {
        res.status(500).send();
      }
    } else {
      res.status(401).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
    }

});

export default router;