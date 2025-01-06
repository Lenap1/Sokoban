import mongoose from 'mongoose';

const highscoreSchema = new mongoose.Schema({
    userId: {
        type: String,  
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Highscore = mongoose.model('Highscore', highscoreSchema);
export default Highscore;
