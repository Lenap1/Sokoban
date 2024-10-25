import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';

const BackgroundContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundImage: `url('/bilder/spongebob.png')`,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: -1,
  },
});

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    navigate('/levels');
  };

  return (
    <>
      <BackgroundContainer />
      <Container maxWidth="xs" sx={{ zIndex: 1, mt: 4, bgcolor: 'rgba(255, 255, 255, 0.8)', p: 3, borderRadius: 2, position: 'relative' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login Page
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink component={Link} to="/levels" sx={{ mr: 2 }}>
            Level Overview
          </MuiLink>
          <MuiLink component={Link} to="/game">
            Game
          </MuiLink>
        </Box>

        <Outlet />
      </Container>
    </>
  );
}

export default Login;
