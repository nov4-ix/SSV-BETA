import { Routes, Route } from 'react-router-dom';
import { UnifiedDashboard } from './pages/unified-dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<UnifiedDashboard />} />
        <Route path="/dashboard" element={<UnifiedDashboard />} />
        <Route path="*" element={<UnifiedDashboard />} />
      </Routes>
    </div>
  );
}

export default App;

