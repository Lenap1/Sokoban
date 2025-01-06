import React from 'react';
import { useRouteError } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const ErrorContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#101010',
  color: '#E6E6E6',
});

const ErrorTitle = styled(Typography)({
  fontSize: '2rem',
  marginBottom: '1rem',
  color: '#ff4444',
});

const ErrorMessage = styled(Typography)({
  marginBottom: '2rem',
  textAlign: 'center',
});

const StyledButton = styled(Button)({
  backgroundColor: '#1E88E5',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#1565C0',
  },
});

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <ErrorContainer>
      <ErrorTitle>Oops!</ErrorTitle>
      <ErrorMessage>
        {error.statusText || error.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
      </ErrorMessage>
      <StyledButton
        variant="contained"
        onClick={() => navigate('/')}
      >
        Zurück zur Startseite
      </StyledButton>
    </ErrorContainer>
  );
}