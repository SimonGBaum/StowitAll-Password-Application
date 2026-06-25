/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Single source of truth for all transition durations — do not scatter these values
const TRANSITION_DURATIONS = {
  '/':        3000,
  '/home':    1500,
  '/create':  1000,
  '/vault':   1500,
  '/profile': 1500,
  '/contact': 1500,
};

const TorchTransitionContext = createContext(null);

export function TorchTransitionProvider({ children }) {
  const [isActive, setIsActive]   = useState(false);
  const [duration, setDuration]   = useState(1500);
  const navigate                  = useNavigate();
  const activeRef                 = useRef(false);

  const triggerTransition = useCallback(
    (destination, dur) => {
      if (activeRef.current) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate(destination);
        return;
      }

      const transitionDur = dur ?? TRANSITION_DURATIONS[destination] ?? 1500;
      activeRef.current = true;
      setDuration(transitionDur);
      setIsActive(true);

      // Cover phase: overlay reaches near-full opacity before navigating
      setTimeout(() => {
        navigate(destination);
        // Fade-out phase: overlay fades out over the full transition duration
        setTimeout(() => {
          setIsActive(false);
          activeRef.current = false;
        }, transitionDur);
      }, 80);
    },
    [navigate],
  );

  return (
    <TorchTransitionContext.Provider value={{ isActive, duration, triggerTransition }}>
      {children}
    </TorchTransitionContext.Provider>
  );
}

export function useTorchTransitionContext() {
  const ctx = useContext(TorchTransitionContext);
  if (!ctx) throw new Error('useTorchTransitionContext must be used within TorchTransitionProvider');
  return ctx;
}
