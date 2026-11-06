import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { RoomPage } from '../pages/RoomPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';

import { HireMePage } from '../pages/HireMePage';
import { ExplorePage } from '../pages/ExplorePage';
import { AccountPage } from '../pages/AccountPage';
import { ChatBot } from '../components/shared/ChatBot';

const GlobalChatBot: React.FC = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith('/room/');
  if (isRoomPage) return null;
  return <ChatBot />;
};

export const AppRouter: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/hire-me" element={<HireMePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route 
            path="/room/:roomId" 
            element={<RoomPage />} 
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <GlobalChatBot />
    </>
  );
};
