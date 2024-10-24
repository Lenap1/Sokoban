import React from 'react';
import { Link } from 'react-router-dom';
function ErrorPage() {
    return (
      <div>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/">Go to Login</a>
      </div>
    );
  }
  
  export default ErrorPage;