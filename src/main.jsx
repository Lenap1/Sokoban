import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'; 
import Login from './Login.jsx'; 
import LevelOverview from './LevelOverview.jsx'; 
import Game from './Game.jsx'; 
import ErrorPage from './ErrorPage.jsx'; 
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    errorElement: <ErrorPage />, 
    children: [
      {
        index: true,
        element: <Login />, 
      },
      {
        path: "game",
        element: <Game />,
      },
      {
        path: "levels",
        element: <LevelOverview />,
      },
  ],
},
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
