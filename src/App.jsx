import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      {/* nav */}
      <Outlet /> {/* routen */}
    </div>
  );
}

export default App;
