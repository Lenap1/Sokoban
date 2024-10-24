import React from 'react';
import { Link } from 'react-router-dom';

function LevelOverview() {
  return (
    <div>
      <h1>Level Overview Page</h1>
      {/* Levelübersichtn */}
      <Link to="/">Back to Login</Link>
      <Link to="/game">Go to Game</Link>
    </div>
  );
}

export default LevelOverview;