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
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/shared/Motion';
import { Navbar } from '../components/shared/Navbar';

// Sign-in screens are a standalone box office with no navbar.
const PAGES_WITHOUT_NAVBAR = ['/login', '/register'];

const GlobalChatBot: React.FC = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith('/room/');
  if (isRoomPage) return null;
  return <ChatBot />;
};

export const AppRouter: React.FC = () => {
  const location = useLocation();

  // Keyed by path so the old page can animate out before the new one comes in.
  // Routes gets the location explicitly so the leaving page keeps rendering its own route meanwhile.
  const showNavbar = !PAGES_WITHOUT_NAVBAR.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <>
          <Navbar />
          {/* The navbar is fixed, so this keeps its space in the page. */}
          <div aria-hidden="true" className="h-(--nav-h)" />
        </>
      )}
      <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>
      <Routes location={location}>
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
      </PageTransition>
      </AnimatePresence>
      <GlobalChatBot />
    </>
  );
};
