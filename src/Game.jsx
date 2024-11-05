import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import playerImg from './assets/player.png';
import boxImg from './assets/box.png';
import goalImg from './assets/goal.png';
import wallImg from './assets/wall.png';
import floorImg from './assets/floor.png';

const levels = [
  `########\n#@     #\n#  $ . #\n########`,
  `########\n#@ $ . #\n#   .  #\n########`,
  `########\n#@    .#\n# $    #\n########`,
  `########\n#  @   #\n# $  . #\n########`,
  `########\n#@   # #\n# $ .  #\n########`,
];

function parseLevel(levelStr) {
  return levelStr.split('\n').map(row => row.split(''));
}

function findPlayer(board) {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === '@') return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

function Game() {
  const { levelId } = useParams(); // Hole den levelId von der URL
  const [currentLevel, setCurrentLevel] = useState(parseInt(levelId, 10)); // Setze den aktuellen Level basierend auf dem URL-Parameter
  const [board, setBoard] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [moveCount, setMoveCount] = useState(0);
  const [highscore, setHighscore] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLevel(currentLevel);
    loadHighscore();
  }, [currentLevel]);

  useEffect(() => {
    if (levelId) {
      setCurrentLevel(parseInt(levelId, 10)); // Update currentLevel, wenn levelId sich ändert
    }
  }, [levelId]);

  const loadLevel = (levelIndex) => {
    const level = levels[levelIndex];
    const parsedBoard = parseLevel(level);
    setBoard(parsedBoard);
    setPlayerPosition(findPlayer(parsedBoard));
    setMoveCount(0);
    setIsCompleted(false);
    setError(null);
  };

  const loadHighscore = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/highscores/${currentLevel}`);
      setHighscore(response.data.highscore);
    } catch (error) {
      console.error("Konnte Highscore nicht laden", error);
    }
  };

  const movePlayer = (dx, dy) => {
    if (isCompleted) return;

    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    const targetCell = board[newY]?.[newX];
    const beyondTargetCell = board[newY + dy]?.[newX + dx];

    const updatedBoard = board.map(row => row.slice());

    if (targetCell === ' ' || targetCell === '.') {
      updatedBoard[playerPosition.y][playerPosition.x] = updatedBoard[playerPosition.y][playerPosition.x] === '@' ? ' ' : '.';
      updatedBoard[newY][newX] = '@';
      setBoard(updatedBoard);
      setPlayerPosition({ x: newX, y: newY });
      setMoveCount(moveCount + 1);
    } else if (targetCell === '$' && (beyondTargetCell === ' ' || beyondTargetCell === '.')) {
      updatedBoard[playerPosition.y][playerPosition.x] = updatedBoard[playerPosition.y][playerPosition.x] === '@' ? ' ' : '.';
      updatedBoard[newY][newX] = '@';
      updatedBoard[newY + dy][newX + dx] = beyondTargetCell === '.' ? '.' : '$';
      setBoard(updatedBoard);
      setPlayerPosition({ x: newX, y: newY });
      setMoveCount(moveCount + 1);
    }

    checkCompletion(updatedBoard);
  };

  const checkCompletion = (updatedBoard) => {
    const allBoxesOnGoals = updatedBoard.every(row => 
      row.every(cell => cell !== '$' || cell === '.')
    );

    if (allBoxesOnGoals) {
      setIsCompleted(true);
      submitHighscore();
    }
  };

  const submitHighscore = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/highscores', {
        level: currentLevel,
        moves: moveCount,
        username: "username123"
      });
      setHighscore(response.data);
    } catch (error) {
      console.error("Score konnte nicht gespeichert werden", error);
      setError("Score konnte nicht gespeichert werden. Bitte später erneut versuchen.");
    }
  };

  const restartLevel = () => {
    loadLevel(currentLevel);
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      alert("Du hast das letzte Level erreicht!");
    }
  };

  return (
    <div className="game-container">
      <h1>Sokoban Game</h1>
      <div>Aktuelle Züge: {moveCount}</div>
      <div>Highscore für dieses Level: {highscore !== null ? highscore : 'Noch kein Highscore vorhanden'}</div>
      {isCompleted && <div style={{ color: 'green' }}>Level abgeschlossen!</div>}
      <div style={{ color: 'red', minHeight: '40px', width: '100%', textAlign: 'center' }}>{error && error}</div>
      <div className="game-board" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        border: '2px solid black', 
        padding: '10px', 
        backgroundColor: 'white', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        height: 'auto',
        width: 'fit-content',
        maxWidth: '600px', 
        margin: '0 auto' // Zentriert die Spielfeld-Box
      }}>
        {board.map((row, y) => (
          <div key={y} style={{ display: 'flex', justifyContent: 'center' }}>
            {row.map((cell, x) => (
              <div key={x} style={{ width: '40px', height: '40px' }}>
                {cell === '@' && <img src={playerImg} alt="Player" style={{ width: '100%' }} />}
                {cell === '$' && <img src={boxImg} alt="Box" style={{ width: '100%' }} />}
                {cell === '.' && <img src={goalImg} alt="Goal" style={{ width: '100%' }} />}
                {cell === '#' && <img src={wallImg} alt="Wall" style={{ width: '100%' }} />}
                {cell === ' ' && <img src={floorImg} alt="Floor" style={{ width: '100%' }} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => movePlayer(-1, 0)} style={buttonStyle}>←</button>
          <button onClick={() => movePlayer(1, 0)} style={buttonStyle}>→</button>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => movePlayer(0, -1)} style={buttonStyle}>↑</button>
          <button onClick={() => movePlayer(0, 1)} style={buttonStyle}>↓</button>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>Back to Login</button>
        </Link>
        <Link to="/levels" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>Go to Level Overview</button>
        </Link>
        <button onClick={restartLevel} style={buttonStyle}>Neustarten</button>
        <button onClick={nextLevel} style={buttonStyle}>Nächstes Level</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '3px 6px', // Kleinere Polsterung für kleinere Buttons
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  fontSize: '12px', // Kleinere Schriftgröße
  minWidth: '30px', // Minimale Breite der Buttons
};


export default Game;