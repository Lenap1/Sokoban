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
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
};

router.post('/', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben und Zahlen enthalten' 
            });
        }

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'E-Mail bereits registriert' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
            username: email,  
            created_at: new Date(),
            active: true,
            highscores: []
        };

        const result = await db.collection('users').insertOne(newUser);
        
        if (!result.acknowledged) {
            throw new Error('Failed to insert user');
        }

        res.status(201).json({
            success: true,
            message: 'Registrierung erfolgreich'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Ein Fehler ist bei der Registrierung aufgetreten'
        });
    }
});

export default router;