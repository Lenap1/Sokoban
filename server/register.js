import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

// E-Mail Validierung
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Passwort Validierung
const validatePassword = (password) => {
    return password.length >= 8;
};

router.post('/', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { username, email, password } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Username, E-Mail und Passwort sind erforderlich' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Passwort muss mindestens 8 Zeichen lang sein' 
            });
        }

        const existingUser = await db.collection('users').findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                error: existingUser.email === email ? 'E-Mail bereits registriert' : 'Benutzername bereits vergeben' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.collection('users').insertOne({
            username,
            email,
            password: hashedPassword,
            created_at: new Date(),
            active: true
        });

        if (result.acknowledged) {
            res.status(201).json({ message: 'Registrierung erfolgreich' });
        } else {
            res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Interner Server-Fehler' });
    }
});

export default router;