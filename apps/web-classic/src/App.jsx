import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { MusicGenerator } from './components/MusicGenerator';
import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studio" element={
          <AuthGuard>
            <MusicGenerator />
          </AuthGuard>
        } />
        <Route path="/ghost-studio" element={
          <AuthGuard>
            <MusicGenerator />
          </AuthGuard>
        } />
        {/* Add more routes as needed */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;