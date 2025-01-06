import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import playerImg from './assets/player.png';
import boxImg from './assets/box.png';
import goalImg from './assets/goal.png';
import wallImg from './assets/wall.png';
import floorImg from './assets/floor.png';
import './Game.css';  

const levels = [
  // Level 1: 
  `##########
#        #
#  $     #
#  @  .  #
#        #
##########`,

  // Level 2: 
  `##########
#        #
#  $     #
#  @     #
#     .  #
##########`,

  // Level 3: 
  `##########
#        #
#  $  #  #
#  @     #
#     .  #
##########`,

  // Level 4: 
  `##########
#   .    #
#  $$    #
#  @  .  #
#        #
##########`,

  // Level 5: 
  `##########
#   .    #
#  $#$   #
#  @ .   #
#        #
##########`,
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
  const { levelId } = useParams(); 
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(parseInt(levelId, 10));
  const [board, setBoard] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [moveCount, setMoveCount] = useState(0);
  const [highscores, setHighscores] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthAndLoadLevel = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/user/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          setUser(response.data);
          loadLevel(currentLevel);
          await loadHighscores();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/');
        }
      }
    };

    checkAuthAndLoadLevel();
  }, [currentLevel, navigate]);

  // Tastatur steuerung
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          movePlayer(0, -1);
          break;
        case 's':
        case 'arrowdown':
          movePlayer(0, 1);
          break;
        case 'a':
        case 'arrowleft':
          movePlayer(-1, 0);
          break;
        case 'd':
        case 'arrowright':
          movePlayer(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [playerPosition, board, isCompleted]); // Dependencies for movePlayer

  const loadHighscores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:3000/highscore/level/${currentLevel}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setHighscores(response.data);
    } catch (error) {
      console.error('Error loading highscores:', error);
      setError('Fehler beim Laden der Highscores');
    }
  };

  const loadLevel = (levelIndex) => {
    const level = levels[levelIndex];
    const parsedBoard = parseLevel(level);
    setBoard(parsedBoard);
    setPlayerPosition(findPlayer(parsedBoard));
    setMoveCount(0);
    setIsCompleted(false);
    setError(null);
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
      saveHighscore();
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          navigate(`/game/${currentLevel + 1}`);
        } else {
          alert("Glückwunsch! Du hast alle Level abgeschlossen!");
          navigate('/levels');
        }
      }, 1500); // 1.5 Sekunden warten
    }
  };

  const saveHighscore = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !user) return;

      const response = await axios.post('http://localhost:3000/highscore/save', {
        score: moveCount,
        level: currentLevel
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Highscore saved successfully!');
        await loadHighscores(); // Reload highscores after saving
      }
    } catch (error) {
      console.error('Failed to save highscore:', error);
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
      <div className="game-header">
        <h1>Sokoban Game</h1>
        <div className="game-info">
          <p>Level: {currentLevel + 1}</p>
          <p>Moves: {moveCount}</p>
        </div>
      </div>

      <div className="game-content">
        <div className="game-board">
          {board.map((row, y) => (
            <div key={y} className="row">
              {row.map((cell, x) => (
                <div key={`${x}-${y}`} className="cell">
                  <img
                    src={
                      cell === '#' ? wallImg :
                      cell === '@' ? playerImg :
                      cell === '$' ? boxImg :
                      cell === '.' ? goalImg :
                      floorImg
                    }
                    alt={cell}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="highscore-panel">
          <h2>Highscores</h2>
          {highscores.length > 0 ? (
            <ul className="highscore-list">
              {highscores.map((score, index) => (
                <li key={index}>
                  {score.userId.username}: {score.score} moves
                </li>
              ))}
            </ul>
          ) : (
            <p>No highscores yet!</p>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isCompleted && (
        <div className="level-complete">
          <h2>Level Complete!</h2>
          <p>You completed the level in {moveCount} moves!</p>
          {currentLevel < levels.length - 1 && (
            <button onClick={() => setCurrentLevel(currentLevel + 1)}>
              Next Level
            </button>
          )}
        </div>
      )}

      <div className="controls">
        <button onClick={() => movePlayer(0, -1)}>Up</button>
        <button onClick={() => movePlayer(-1, 0)}>Left</button>
        <button onClick={() => movePlayer(0, 1)}>Down</button>
        <button onClick={() => movePlayer(1, 0)}>Right</button>
      </div>
    </div>
  );
}

export default Game;
