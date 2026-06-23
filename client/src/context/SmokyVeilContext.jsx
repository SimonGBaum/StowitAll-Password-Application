/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback } from 'react';

export const SmokyVeilContext = createContext(null);

export function SmokyVeilProvider({ children }) {
  const [phase, setPhase] = useState('idle'); // idle | fade-in | hold | fade-out
  const callbackRef = useRef(null);

  const triggerVeil = useCallback((callback) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      callback();
      return;
    }

    callbackRef.current = callback;
    setPhase('fade-in');

    setTimeout(() => {
      setPhase('hold');
      if (callbackRef.current) callbackRef.current();

      setTimeout(() => {
        setPhase('fade-out');

        setTimeout(() => {
          setPhase('idle');
        }, 150);
      }, 150);
    }, 150);
  }, []);

  return (
    <SmokyVeilContext.Provider value={{ phase, triggerVeil }}>
      {children}
    </SmokyVeilContext.Provider>
  );
}

export function useSmokyVeil() {
  return useContext(SmokyVeilContext);
}
