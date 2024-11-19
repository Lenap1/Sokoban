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
  backgroundColor: '#1a1a1a', 
  color: '#fff',
  padding: '0 20px',
  textAlign: 'center',
  width: '100%',
  overflowX: 'hidden',
});

const Title = styled(Typography)({
  fontSize: '48px',
  fontWeight: '800',
  color: '#00aaff', 
  marginBottom: '20px',
});

const SubTitle = styled(Typography)({
  fontSize: '24px',
  color: '#b0b0b0', 
  marginBottom: '40px',
});

const LevelButton = styled(Button)({
  margin: '15px',
  padding: '25px 60px',
  backgroundColor: '#00aaff', 
  color: '#fff',
  borderRadius: '10px',
  fontSize: '26px',
  textTransform: 'uppercase',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: '#0077cc', 
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
  },
});

const BackButton = styled(Button)({
  marginTop: '40px',
  padding: '15px 50px',
  backgroundColor: '#333', 
  color: '#fff',
  borderRadius: '10px',
  fontSize: '18px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#222', 
  },
});

function LevelOverview() {
  return (
    <LevelContainer>
      <Title>Wähle dein Level</Title>
      <SubTitle>Bereit, dich der Herausforderung zu stellen?</SubTitle>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
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
