import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { AgentDetail } from './pages/AgentDetail';
import { Console } from './pages/Console';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/console" element={<Console />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
