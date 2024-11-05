import React from 'react';
import { Link } from 'react-router-dom';

const levels = [
  { id: 0, name: 'Level 1' },
  { id: 1, name: 'Level 2' },
  { id: 2, name: 'Level 3' },
  { id: 3, name: 'Level 4' },
  { id: 4, name: 'Level 5' },
];

function LevelOverview() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f0f0' 
    }}>
      <h1>Level Übersicht</h1>
      <div style={{ margin: '20px' }}>
        {levels.map(level => (
          <Link key={level.id} to={`/game/${level.id}`} style={{ 
            textDecoration: 'none', 
            margin: '10px',
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            borderRadius: '5px',
            transition: 'background-color 0.3s',
            display: 'inline-block'
          }}>
            {level.name}
          </Link>
        ))}
      </div>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button style={{ 
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Zurück zur Anmeldung
        </button>
      </Link>
    </div>
  );
}

export default LevelOverview;
