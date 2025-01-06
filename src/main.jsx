import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx';
import LevelOverview from './LevelOverview.jsx'; 
import Game from './Game.jsx'; 
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,           
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "levels",        
        element: <LevelOverview />,
      },
      {
        path: "game/:levelId", 
        element: <Game />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
