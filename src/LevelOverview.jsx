import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import './LevelOverview.css';  // Füge hier den Import der CSS-Datei hinzu

const levels = [
  { id: 0, name: 'Level 1' },
  { id: 1, name: 'Level 2' },
  { id: 2, name: 'Level 3' },
  { id: 3, name: 'Level 4' },
  { id: 4, name: 'Level 5' },
];

function LevelOverview() {
  return (
    <div className="level-overview">
      <Box className="title-box">
        <Typography variant="h2">
          Wähle dein Level
        </Typography>
        <Typography variant="h6">
          Bereit für das Abenteuer?
        </Typography>
      </Box>

      <Box className="button-container">
        <Box className="level-buttons">
          {levels.map((level) => (
            <Link key={level.id} to={`/game/${level.id}`} className="link">
              <Button className="level-button">
                {level.name}
              </Button>
            </Link>
          ))}
        </Box>

        <Link to="/" className="link">
          <Button className="back-button">
            Zurück zur Anmeldung
          </Button>
        </Link>
      </Box>
    </div>
  );
}

export default LevelOverview;
