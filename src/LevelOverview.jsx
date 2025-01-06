import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const levels = [
  { id: 0, name: 'Level 1' },
  { id: 1, name: 'Level 2' },
  { id: 2, name: 'Level 3' },
  { id: 3, name: 'Level 4' },
  { id: 4, name: 'Level 5' },
];

const LevelContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#101010', 
  color: '#E6E6E6', 
  padding: '40px 20px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '1380px', 
  margin: '0 auto',
  overflow: 'hidden', 
  boxSizing: 'border-box', 
});

const Title = styled(Typography)({
  fontSize: '48px',
  fontWeight: '700',
  color: '#1E88E5', 
  marginBottom: '20px',
});

const SubTitle = styled(Typography)({
  fontSize: '22px',
  color: '#B0B0B0', 
  marginBottom: '30px',
  fontStyle: 'italic',
});

const LevelButton = styled(Button)({
  margin: '10px',
  padding: '20px 50px',
  backgroundColor: '#1E88E5', 
  color: '#FFFFFF', 
  borderRadius: '30px',
  fontSize: '20px',
  '&:hover': {
    backgroundColor: '#1565C0',
  },
});

const ScoreCard = styled(Paper)({
  padding: '10px',
  margin: '5px 0',
  backgroundColor: '#1E1E1E',
  color: '#E6E6E6',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

function LevelOverview() {
  const [highscores, setHighscores] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadHighscores = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/');
          return;
        }
        const authResponse = await axios.get('http://localhost:3000/api/user/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (!authResponse.data) {
          navigate('/');
          return;
        }

        const scores = {};
        for (const level of levels) {
          try {
            const response = await axios.get(`http://localhost:3000/highscore/level/${level.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            scores[level.id] = response.data;
          } catch (error) {
            console.error(`Error loading highscores for level ${level.id}:`, error);
            scores[level.id] = [];
          }
        }
        setHighscores(scores);
      } catch (error) {
        console.error('Error loading highscores:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/');
        }
      }
    };

    checkAuthAndLoadHighscores();
  }, [navigate]);

  return (
    <LevelContainer>
      <Title>Wähle dein Level</Title>
      <SubTitle>Bereit für das nächste?</SubTitle>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', maxWidth: '800px' }}>
        {levels.map((level) => (
          <Box key={level.id} sx={{ width: '100%', maxWidth: '350px' }}>
            <Link to={`/game/${level.id}`} style={{ textDecoration: 'none' }}>
              <LevelButton variant="contained" fullWidth>
                {level.name}
              </LevelButton>
            </Link>
            
            {/* Highscores for this level */}
            <Box sx={{ mt: 1, mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#B0B0B0', mb: 1 }}>
                Highscores:
              </Typography>
              {highscores[level.id]?.slice(0, 3).map((score, index) => (
                <ScoreCard key={index} elevation={2}>
                  <Typography>{score.username}</Typography>
                  <Typography>{score.score} Züge</Typography>
                </ScoreCard>
              ))}
              {(!highscores[level.id] || highscores[level.id].length === 0) && (
                <Typography sx={{ color: '#666' }}>
                  Noch keine Highscores
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <Link to="/" style={{ textDecoration: 'none', marginTop: '30px' }}>
        <LevelButton variant="contained">
          Zurück zur Anmeldung
        </LevelButton>
      </Link>
    </LevelContainer>
  );
}

export default LevelOverview;
