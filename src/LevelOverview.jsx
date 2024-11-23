import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

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
  margin: '0px',
  padding: '20px 50px',
  backgroundColor: '#1E88E5', 
  color: '#FFFFFF', 
  borderRadius: '30px',
  fontSize: '20px',
  fontWeight: '600',
  textTransform: 'uppercase',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: '#1565C0', 
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  },
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  '&:active': {
    transform: 'scale(0.98)', 
  },
});

const BackButton = styled(Button)({
  marginTop: '40px',
  padding: '15px 50px',
  backgroundColor: '#333333', 
  color: '#E6E6E6',
  borderRadius: '30px',
  fontSize: '18px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#444444', 
  },
});

function LevelOverview() {
  return (
    <LevelContainer>
      <Title>Wähle dein Level</Title>
      <SubTitle>Bereit für das Abenteuer?</SubTitle>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          gap: '20px', 
        }}
      >
        {levels.map((level) => (
          <Link key={level.id} to={`/game/${level.id}`} style={{ textDecoration: 'none' }}>
            <LevelButton variant="contained">{level.name}</LevelButton>
          </Link>
        ))}
      </Box>

      <Link to="/" style={{ textDecoration: 'none' }}>
        <BackButton variant="contained">Zurück zur Anmeldung</BackButton>
      </Link>
    </LevelContainer>
  );
}

export default LevelOverview;
