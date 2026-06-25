import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { PasswordProvider } from './context/PasswordContext';
import { ToastProvider } from './context/ToastContext';
import { WalkingTransitionProvider } from './context/WalkingTransitionContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PasswordProvider>
        <ToastProvider>
          <WalkingTransitionProvider>
            <App />
          </WalkingTransitionProvider>
        </ToastProvider>
      </PasswordProvider>
    </AuthProvider>
  </StrictMode>
);
