import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
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


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/user');
      const users = await response.json();

      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
      } else {
        alert('Ungültiger Benutzername oder Passwort');
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
    }

    navigate('/levels');
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
            Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} className="login-form"> 
            <TextField
              label="Benutzername"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"  
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
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="login-button"  
            >
              Anmelden
            </Button>
          </Box>
        </div>
      </Container>
    </>
  );
};

export default Login;
