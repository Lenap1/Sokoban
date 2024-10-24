import React from 'react';
import { Link } from 'react-router-dom';

function Game() {
  return (
    <div>
      <h1>Game</h1>
      {/* Spiellogik */}
      <Link to="/">Back to Login</Link>
      <Link to="/levels">Go to Level Overview</Link>
    </div>
  );
}

export default Game;