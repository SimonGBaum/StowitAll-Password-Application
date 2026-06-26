/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Single source of truth for all transition durations (milliseconds).
// To adjust a duration: change the value for the target route here.
// Also update the duration={} prop at the call site (NavLink, logout handlers, etc.)
export const TRANSITION_DURATIONS = {
  '/home':    3000,
  '/create':  3000,
  '/vault':   3000,
  '/profile': 3000,
  '/contact': 3000,
  '/':        3000,
};

export const TorchTransitionContext = createContext(null);

export function TorchTransitionProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(3000);
  const navigate = useNavigate();

  const triggerTransition = useCallback((destination, dur) => {
    if (isActive) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(destination);
      return;
    }

    setDuration(dur);
    setIsActive(true);

    setTimeout(() => {
      navigate(destination);
      setTimeout(() => {
        setIsActive(false);
      }, dur);
    }, 80);
  }, [isActive, navigate]);

  return (
    <TorchTransitionContext.Provider value={{ triggerTransition, isActive, duration }}>
      {children}
    </TorchTransitionContext.Provider>
  );
}

export function useTorchTransition() {
  return useContext(TorchTransitionContext);
}
