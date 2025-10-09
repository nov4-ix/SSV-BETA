import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UnifiedDashboard } from './pages/unified-dashboard';
import { GhostStudio } from './pages/ghost-studio';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<UnifiedDashboard />} />
        <Route path="/dashboard" element={<UnifiedDashboard />} />
        <Route path="/studio" element={<GhostStudio />} />
        <Route path="/ghost-studio" element={<GhostStudio />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<UnifiedDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
