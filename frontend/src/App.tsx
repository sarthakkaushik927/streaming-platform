import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ToastProvider } from './components/shared/Toast';
import { AppRouter } from './router';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const theme = useThemeStore(state => state.theme);
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // reducedMotion="user" turns movement off for people who ask their system for less motion.
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
