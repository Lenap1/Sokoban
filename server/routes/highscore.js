import express from 'express';
import Highscore from '../highscoreModel.js';

const router = express.Router();

// Save a new highscore
router.post('/save', async (req, res) => {
    try {
        const { score, level } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = req.user.username; // Using username as userId
        const db = req.app.get('db');
        
        // Check if user already has a score for this level
        const existingScore = await db.collection('highscores').findOne({ userId, level });

        if (existingScore) {
            // Update if new score is better
            if (score < existingScore.score) {
                await db.collection('highscores').updateOne(
                    { userId, level },
                    { 
                        $set: { 
                            score,
                            timestamp: new Date()
                        }
                    }
                );
            }
        } else {
            // Insert new score
            await db.collection('highscores').insertOne({
                userId,
                score,
                level,
                timestamp: new Date()
            });
        }

        // Get updated total score for the user
        const userScores = await db.collection('highscores').aggregate([
            {
                $match: { userId }
            },
            {
                $group: {
                    _id: null,
                    totalScore: { $sum: "$score" },
                    levelsCompleted: { $addToSet: "$level" }
                }
            }
        ]).toArray();

        const userStats = userScores[0] || { totalScore: score, levelsCompleted: [level] };

        res.status(201).json({ 
            message: 'Highscore saved successfully',
            totalScore: userStats.totalScore,
            levelsCompleted: userStats.levelsCompleted.length
        });
    } catch (error) {
        console.error('Error saving highscore:', error);
        res.status(500).json({ message: 'Error saving highscore', error: error.message });
    }
});

// Get highscores for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = req.params.userId;
        
        const highscores = await Highscore.find({ userId })
            .sort({ score: -1, timestamp: -1 })
            .limit(10);
        
        res.json(highscores);
    } catch (error) {
        console.error('Error fetching highscores:', error);
        res.status(500).json({ message: 'Error fetching highscores', error: error.message });
    }
});

// Get highscores for a specific level
router.get('/level/:level', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const level = parseInt(req.params.level);
        const db = req.app.get('db');
        
        // Get highscores from MongoDB directly
        const highscores = await db.collection('highscores')
            .find({ level })
            .sort({ score: 1 }) // Lower score is better in Sokoban
            .limit(10)
            .toArray();

        // Add username to each highscore
        const highscoresWithUsernames = highscores.map(score => ({
            ...score,
            username: score.userId // The userId is actually the username/email
        }));

        res.json(highscoresWithUsernames);
    } catch (error) {
        console.error('Error fetching highscores:', error);
        res.status(500).json({ message: 'Error fetching highscores', error: error.message });
    }
});

// Get overall highscores
router.get('/overall', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Get the total scores for each user
        const highscores = await Highscore.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    levelsCompleted: { $addToSet: "$level" }
                }
            },
            {
                $project: {
                    userId: "$_id",
                    totalScore: 1,
                    levelsCompleted: { $size: "$levelsCompleted" }
                }
            },
            {
                $sort: { totalScore: 1 } // Lower score is better
            },
            {
                $limit: 10
            }
        ]);

        // Get usernames for the highscores
        const userIds = highscores.map(score => score.userId);
        const users = await Highscore.find({ userId: { $in: userIds } })
            .toArray();

        // Map usernames to highscores
        const highscoresWithUsernames = highscores.map(score => {
            const user = users.find(u => u.userId === score.userId);
            return {
                username: user ? user.userId : 'Unknown User',
                totalScore: score.totalScore,
                levelsCompleted: score.levelsCompleted
            };
        });

        res.json(highscoresWithUsernames);
    } catch (error) {
        console.error('Error fetching highscores:', error);
        res.status(500).json({ message: 'Error fetching highscores', error: error.message });
    }
});

export default router;
