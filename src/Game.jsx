import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, Grid, IconButton } from '@mui/material';
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward, Refresh, ExitToApp } from '@mui/icons-material';
import axios from 'axios';
import playerImg from './assets/player.png';
import boxImg from './assets/box.png';
import goalImg from './assets/goal.png';
import wallImg from './assets/wall.png';
import floorImg from './assets/floor.png';

const levels = [
  // Level 1 
  `##########
#    . .  #
# #$#$#$# #
#    @    #
##########`,

  // Level 2 
  `###########
# . .     #
# $  # ## #
#  $ @    #
###########`,

  // Level 3 
  `############
#  . # .    #
# $$#  $    #
#    @      #
############`,

  // Level 4 
  `##########
#   .    #
#  $ .   #
#  $@ .  #
#  $  .  #
#        #
##########`,

  // Level 5 
 `##########
#    @   #
#  $$# # #
#   #   .#
#  $    # #
#  #  $$  #
#   .  #  #
#   #     #
##########`
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
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, board, isCompleted]);

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

  const checkCompletion = async (updatedBoard) => {
    const allBoxesOnGoals = updatedBoard.every(row => 
      row.every(cell => cell !== '$' || cell === '.')
    );

    if (allBoxesOnGoals) {
      setIsCompleted(true);
      await saveHighscore();
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
        await loadHighscores();
      }
    } catch (error) {
      console.error('Failed to save highscore:', error);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1);
      loadLevel(currentLevel + 1);
      setIsCompleted(false);
    } else {
      navigate('/levels');
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#2c1b47',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Paper
              sx={{
                padding: 2,
                backgroundColor: '#3d2661',
                border: '2px solid #ffd700',
                borderRadius: '15px',
                marginBottom: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#ffd700',
                    fontWeight: 'bold'
                  }}
                >
                  Level {currentLevel + 1}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ffd700'
                  }}
                >
                  Züge: {moveCount}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Game Board */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                padding: 2,
                backgroundColor: '#3d2661',
                border: '2px solid #ffd700',
                borderRadius: '15px'
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  justifyContent: 'center'
                }}
              >
                {board.map((row, y) => (
                  <Box
                    key={y}
                    sx={{
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    {row.map((cell, x) => (
                      <Box
                        key={`${x}-${y}`}
                        sx={{
                          width: 40,
                          height: 40,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src={
                            cell === '#' ? wallImg :
                            cell === '@' ? playerImg :
                            cell === '$' ? boxImg :
                            cell === '.' ? goalImg :
                            floorImg
                          }
                          alt={cell}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>

              {/* Controls */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  marginTop: 3
                }}
              >
                <IconButton
                  onClick={() => movePlayer(0, -1)}
                  sx={{
                    backgroundColor: '#ffd700',
                    color: '#2c1b47',
                    '&:hover': {
                      backgroundColor: '#e6c200'
                    }
                  }}
                >
                  <ArrowUpward />
                </IconButton>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton
                    onClick={() => movePlayer(-1, 0)}
                    sx={{
                      backgroundColor: '#ffd700',
                      color: '#2c1b47',
                      '&:hover': {
                        backgroundColor: '#e6c200'
                      }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton
                    onClick={() => movePlayer(0, 1)}
                    sx={{
                      backgroundColor: '#ffd700',
                      color: '#2c1b47',
                      '&:hover': {
                        backgroundColor: '#e6c200'
                      }
                    }}
                  >
                    <ArrowDownward />
                  </IconButton>
                  <IconButton
                    onClick={() => movePlayer(1, 0)}
                    sx={{
                      backgroundColor: '#ffd700',
                      color: '#2c1b47',
                      '&:hover': {
                        backgroundColor: '#e6c200'
                      }
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Highscores */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                padding: 2,
                backgroundColor: '#3d2661',
                border: '2px solid #ffd700',
                borderRadius: '15px',
                height: '100%'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#ffd700',
                  marginBottom: 2,
                  textAlign: 'center'
                }}
              >
                Highscores
              </Typography>
              {highscores.length > 0 ? (
                <Box sx={{ color: '#ffffff' }}>
                  {highscores.map((score, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 1,
                        borderBottom: '1px solid #ffd700'
                      }}
                    >
                      <Typography>{score.userId.username}</Typography>
                      <Typography>{score.score} Züge</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: '#ffffff', textAlign: 'center' }}>
                  Noch keine Highscores
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                startIcon={<Refresh />}
                onClick={() => loadLevel(currentLevel)}
                sx={{
                  backgroundColor: '#ffd700',
                  color: '#2c1b47',
                  '&:hover': {
                    backgroundColor: '#e6c200'
                  }
                }}
              >
                Level neu starten
              </Button>
              <Button
                startIcon={<ExitToApp />}
                onClick={() => navigate('/levels')}
                sx={{
                  backgroundColor: '#ffd700',
                  color: '#2c1b47',
                  '&:hover': {
                    backgroundColor: '#e6c200'
                  }
                }}
              >
                Zurück zur Übersicht
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Level Complete Dialog */}
        {isCompleted && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <Paper
              sx={{
                padding: 4,
                backgroundColor: '#3d2661',
                border: '2px solid #ffd700',
                borderRadius: '15px',
                textAlign: 'center'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: '#ffd700',
                  marginBottom: 2
                }}
              >
                Level geschafft!
              </Typography>
              <Typography
                sx={{
                  color: '#ffffff',
                  marginBottom: 3
                }}
              >
                Du hast das Level in {moveCount} Zügen geschafft!
              </Typography>
              {currentLevel < 4 ? (
                <Button
                  variant="contained"
                  onClick={handleNextLevel}
                  sx={{
                    backgroundColor: '#ffd700',
                    color: '#2c1b47',
                    padding: '10px 30px',
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#e6c200'
                    }
                  }}
                >
                  Weiter zu Level {currentLevel + 2}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => navigate('/levels')}
                  sx={{
                    backgroundColor: '#ffd700',
                    color: '#2c1b47',
                    padding: '10px 30px',
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#e6c200'
                    }
                  }}
                >
                  Zurück zur Übersicht
                </Button>
              )}
            </Paper>
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Typography
            sx={{
              color: '#ff6b6b',
              textAlign: 'center',
              marginTop: 2
            }}
          >
            {error}
          </Typography>
        )}
      </Container>
    </Box>
  );
}

export default Game;
