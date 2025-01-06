import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/user/register', {
        username,
        email,
        password
      });
      navigate('/login');
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      console.error('Registration error:', err);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#2c1b47',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: '#3d2661',
            border: '2px solid #ffd700',
            borderRadius: '15px'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: '#ffd700',
              textAlign: 'center',
              marginBottom: 4,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Registrierung
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#ffd700',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#ffffff',
                },
                marginBottom: 2
              }}
            />

            <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#ffd700',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#ffffff',
                },
                marginBottom: 2
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#ffd700',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#ffffff',
                },
                marginBottom: 2
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Passwort bestätigen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#ffd700',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#ffffff',
                },
                marginBottom: 3
              }}
            />

            {error && (
              <Typography
                sx={{
                  color: '#ff6b6b',
                  marginBottom: 2,
                  textAlign: 'center'
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              sx={{
                backgroundColor: '#ffd700',
                color: '#2c1b47',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#e6c200',
                },
                marginBottom: 2
              }}
            >
              Registrieren
            </Button>

            <Box
              sx={{
                textAlign: 'center',
                marginTop: 2
              }}
            >
              <Link
                to="/login"
                style={{
                  color: '#ffd700',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <Typography>
                  Hier registrieren
                </Typography>
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
