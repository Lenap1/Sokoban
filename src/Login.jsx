import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Login() {
  return (
    <div>
      <h1>Login Page</h1>
      {/* Login formular */}
      <Link to="/levels">Go to Level Overview</Link>
      <Link to="/game">Go to Game</Link>
      {/* andere routen */}
      <Outlet />
    </div>
  );
}

export default Login;