import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { styled } from '@mui/system';

const BackgroundContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundImage: `url('/bilder/Background.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: -1,
  },
});

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (!validatePassword(password)) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben und Zahlen enthalten');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || 'Ein Fehler ist aufgetreten';
        } catch (e) {
          errorMessage = 'Ein Fehler ist aufgetreten';
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      
      // Zeige Erfolgsmeldung und leite zur Login-Seite weiter
      alert('Registrierung erfolgreich! Sie können sich jetzt einloggen.');
      navigate('/');
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
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

      <BackgroundContainer />
      <Container maxWidth="xs" sx={{ zIndex: 1, mt: 6 }}>
        <div className="login-container">
          <Typography variant="h4" gutterBottom className="login-header">
            Registrierung
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleRegister} className="login-form">
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
              helperText="Mindestens 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe und eine Zahl"
            />
            <TextField
              label="Passwort bestätigen"
              variant="outlined"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Registrierung...' : 'Registrieren'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/" variant="body2">
                Zurück zum Login
              </Link>
            </Box>
          </Box>
        </div>
      </Container>
    </>
  );
};

export default Register;
