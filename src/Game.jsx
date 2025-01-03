import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import playerImg from './assets/player.png';
import boxImg from './assets/box.png';
import goalImg from './assets/goal.png';
import wallImg from './assets/wall.png';
import floorImg from './assets/floor.png';
import './Game.css';

const levels = [
  // Level 1: Einfaches Layout
  `########
  #@     #
  #  $ . #
  ########`,

  // Level 2: Mehr Platz für Bewegungen
  `##########
  #@   $   #
  #   ##   #
  # $ ## . #
  #   ##   #
  ##########`,

  // Level 3: Komplexeres Layout mit mehr Hindernissen
  `##########
  #@  $  . #
  #   ##   #
  #   ## $ #
  #   .    #
  ##########`,

  // Level 4: Engeres Labyrinth mit weniger Bewegungsfreiheit
  `##########
  #@   .   #
  #  $  ## #
  # $   .  #
  #   ##   #
  ##########`,

  // Level 5: Mehrere Kisten und Ziele
  `##########
  #@  .    #
  #  $  $  #
  #  .  .  #
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
  const [currentLevel, setCurrentLevel] = useState(parseInt(levelId, 10));
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
      <div className="current-move">Aktuelle Züge: {moveCount}</div>
      <div className="highscore">Highscore für dieses Level: {highscore !== null ? highscore : 'Noch kein Highscore vorhanden'}</div>

      {isCompleted && <div className="level-completed">Level abgeschlossen!</div>}
      <div className="error-message">{error && error}</div>
      <div className="game-board">
        {board.map((row, y) => (
          <div key={y} className="game-row">
            {row.map((cell, x) => (
              <div key={x} className="game-cell">
                {cell === '@' && <img src={playerImg} alt="Player" className="game-piece" />}
                {cell === '$' && <img src={boxImg} alt="Box" className="game-piece" />}
                {cell === '.' && <img src={goalImg} alt="Goal" className="game-piece" />}
                {cell === '#' && <img src={wallImg} alt="Wall" className="game-piece" />}
                {cell === ' ' && <img src={floorImg} alt="Floor" className="game-piece" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="controls">
        <div className="control-buttons">
          <button onClick={() => movePlayer(-1, 0)} className="move-button">←</button>
          <button onClick={() => movePlayer(1, 0)} className="move-button">→</button>
        </div>
        <div className="control-buttons">
          <button onClick={() => movePlayer(0, -1)} className="move-button">↑</button>
          <button onClick={() => movePlayer(0, 1)} className="move-button">↓</button>
        </div>
      </div>
      <div className="actions">
        <Link to="/" className="link-button">
          <button className="action-button">Back to Login</button>
        </Link>
        <Link to="/levels" className="link-button">
          <button className="action-button">Go to Level Overview</button>
        </Link>
        <button onClick={restartLevel} className="action-button">Neustarten</button>
        <button onClick={nextLevel} className="action-button">Nächstes Level</button>
      </div>
    </div>
  );
}

export default Game;
