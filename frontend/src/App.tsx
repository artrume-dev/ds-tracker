import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TokenDetails from './components/TokenDetails';
import TeamManagement from './components/TeamManagement';
import TeamPage from './components/TeamPage';
import ChangeRequests from './components/ChangeRequests';
import { EmailConfigPage } from './components/EmailConfigPage';
import { TeamSubscriptionPage } from './components/TeamSubscriptionPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tokens/:tokenId" element={<TokenDetails />} />
                <Route path="/teams" element={<TeamManagement />} />
                <Route path="/team/:teamName" element={<TeamPage />} />
                <Route path="/change-requests" element={<ChangeRequests />} />
                <Route path="/team-subscriptions" element={<TeamSubscriptionPage />} />
                <Route path="/email-config" element={<EmailConfigPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
