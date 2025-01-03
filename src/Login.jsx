import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (!validatePassword(password)) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      const tokenResponse = await fetch('http://localhost:3000/api/token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: 'client'
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();

        localStorage.setItem('accessToken', tokenData.access_token);
        localStorage.setItem('refreshToken', tokenData.refresh_token);
        localStorage.setItem('tokenExpiry', new Date(Date.now() + tokenData.expires_in * 1000).toISOString());

        navigate('/levels');
      } else {
        const errorData = await tokenResponse.json();
        setError(errorData.error_description || 'Ungültige Anmeldedaten');
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="h1">Welcome to the Sokoban Game</h1>
      </div>

      <div className="background-container"></div>
      <Container maxWidth="xs" sx={{ zIndex: 1, mt: 6 }}>
        <div className="login-container">
          <Typography variant="h4" gutterBottom className="login-header">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleLogin} className="login-form">
            <TextField
              label="E-Mail"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              disabled={loading}
            />
            <TextField
              label="Passwort"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Anmeldung...' : 'Anmelden'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/register" variant="body2">
                Noch kein Konto? Hier registrieren
              </Link>
            </Box>
          </Box>
        </div>
      </Container>
    </>
  );
};

export default Login;
