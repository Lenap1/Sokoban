import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tokenResponse = await fetch('http://localhost:3000/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: 'client'
        }).toString()
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error_description || 'Ungültige Anmeldedaten';
        } catch (e) {
          errorMessage = 'Ungültige Anmeldedaten';
        }
        setError(errorMessage);
        return;
      }

      const tokenData = await tokenResponse.json();
      
      // Speichere Tokens sicher
      localStorage.setItem('accessToken', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('refreshToken', tokenData.refresh_token);
      }
      localStorage.setItem('tokenExpiry', new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString());
      
      navigate('/levels');
    } catch (error) {
      console.error('Fehler beim Login:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
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
            Login
          </Typography>

          <form onSubmit={handleSubmit}>
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
              disabled={loading}
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
              {loading ? 'Anmeldung...' : 'Einloggen'}
            </Button>

            <Box
              sx={{
                textAlign: 'center',
                marginTop: 2
              }}
            >
              <Link
                to="/register"
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

export default Login;
