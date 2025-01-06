import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Paper, Container } from '@mui/material';
import axios from 'axios';

const levels = [
  { id: 0, name: 'Level 1' },
  { id: 1, name: 'Level 2' },
  { id: 2, name: 'Level 3' },
  { id: 3, name: 'Level 4' },
  { id: 4, name: 'Level 5' },
];

function LevelOverview() {
  const navigate = useNavigate();
  const [highscores, setHighscores] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHighscores = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/');
          return;
        }

        const authResponse = await axios.get('http://localhost:3000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
                Authorization: `Bearer ${token}`,
              },
            });
            scores[level.id] = response.data;
          } catch (error) {
            console.error(`Error loading highscores for level ${level.id}:`, error);
            scores[level.id] = [];
          }
        }
        setHighscores(scores);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading highscores:', error);
        setIsLoading(false);
      }
    };

    fetchHighscores();
  }, [navigate]);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  return (
    <Box sx={{
      backgroundColor: '#2c1b47',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <Container maxWidth="lg">
        <Button
          onClick={handleBack}
          sx={{
            backgroundColor: '#ffd700',
            color: '#2c1b47',
            fontWeight: 'bold',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#e6c200'
            },
            marginBottom: '2rem'
          }}
        >
          Zurück zur Anmeldung
        </Button>

        <Typography
          variant="h2"
          sx={{
            color: '#ffd700',
            textAlign: 'center',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 'bold'
          }}
        >
          Wähle dein Level
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem',
          padding: '1rem'
        }}>
          {levels.map((level) => {
            return (
              <Paper
                key={level.id}
                onClick={() => navigate(`/game/${level.id}`)}
                sx={{
                  backgroundColor: '#3d2661',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid #ffd700',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: '#ffd700',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}
                >
                  {level.name}
                </Typography>
                
                <Box sx={{ mt: 1, mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#B0B0B0',
                      mb: 1
                    }}
                  >
                    Highscores:
                  </Typography>
                  {highscores[level.id]?.slice(0, 3).map((score, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography>{score.username}</Typography>
                      <Typography>{score.score} Züge</Typography>
                    </Box>
                  ))}
                  {(!highscores[level.id] || highscores[level.id].length === 0) && (
                    <Typography sx={{ color: '#666' }}>
                      Noch keine Highscores
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default LevelOverview;
