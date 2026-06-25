/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { WALK_FADE_IN, WALK_FADE_OUT } from '../lib/animationConstants';

export const WalkingTransitionContext = createContext(null);

export function WalkingTransitionProvider({ children }) {
  const [phase, setPhase] = useState('idle'); // idle | entering | active | exiting
  const callbackRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  const triggerWalk = useCallback((callback, durationMs) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      callback();
      return;
    }

    clearTimers();
    callbackRef.current = callback;
    setPhase('entering');

    // After fade-in completes, go active and fire the navigation callback so the
    // destination page loads underneath while the overlay is still visible.
    schedule(() => {
      setPhase('active');
      if (callbackRef.current) callbackRef.current();

      // Hold for the full walking duration, then begin fade-out
      schedule(() => {
        setPhase('exiting');

        schedule(() => {
          setPhase('idle');
        }, WALK_FADE_OUT);
      }, durationMs);
    }, WALK_FADE_IN);
  }, []);

  return (
    <WalkingTransitionContext.Provider value={{ phase, triggerWalk }}>
      {children}
    </WalkingTransitionContext.Provider>
  );
}

export function useWalkingTransition() {
  return useContext(WalkingTransitionContext);
}
