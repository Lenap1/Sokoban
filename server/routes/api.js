// api.js
import express from 'express';
import userRouter from './user.js'; 

const router = express.Router();

// Benutzer-Routen
router.use('/user', userRouter);

// Route zum Abrufen der Highscores für ein bestimmtes Level
router.get('/highscores/:level', async (req, res) => {
    const level = req.params.level;
    const db = req.app.get('db');

    try {
        // Hier die Logik zum Abrufen der Highscores aus der Datenbank hinzufügen
        const highscores = await db.collection('highscores').find({ level }).toArray();
        res.json(highscores);
    } catch (err) {
        console.error('Fehler beim Abrufen der Highscores:', err);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// Route zum Speichern eines Highscores
router.post('/highscores', async (req, res) => {
    const { level, name, score } = req.body;
    const db = req.app.get('db');

    try {
        await db.collection('highscores').insertOne({ level, name, score });
        res.status(201).json({ message: 'Highscore gespeichert' });
    } catch (err) {
        console.error('Fehler beim Speichern des Highscores:', err);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

export default router;
