import { useState, useRef, useEffect, useCallback } from 'react';
import { usePasswords } from '../../context/PasswordContext';
import { useSmokyVeil } from '../../context/SmokyVeilContext';
import { useToast } from '../../context/ToastContext';
import { ForgeAnvil } from '../ForgeAnvil/ForgeAnvil';
import { supabase } from '../../lib/supabaseClient';
import { computeSHA1Prefix, computePasswordStrength } from '../../lib/hibp';
import styles from './GrandCrucible.module.css';

const SWIRL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

// ─── All forge animation timing — edit here to tune the sequence ──────────
const TIMING = {
  hammerSwingMs:   350,  // hammer arc to anvil contact
  sparkDurationMs: 380,  // spark burst lifetime (completes just before swirl ends)
  swirlDurationMs: 400,  // character scramble duration (starts at contact)
  swirlIntervalMs:  60,  // scramble character refresh rate
};

function randomChar() {
  return SWIRL_CHARS[Math.floor(Math.random() * SWIRL_CHARS.length)];
}

export function GrandCrucible({ onPasswordForged }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [constraintMsg, setConstraintMsg] = useState('');
  const [forgeState, setForgeState] = useState('idle');  // idle | forging | resolved
  const [forgePhase, setForgePhase] = useState('idle');  // idle | swinging | struck
  const [output, setOutput] = useState('');
  const [swirlDisplay, setSwirlDisplay] = useState('');
  const [hibpState, setHibpState] = useState({ status: 'idle' }); // idle | loading | result | error

  const { forgePassword } = usePasswords();
  const { triggerVeil } = useSmokyVeil();
  const { addToast } = useToast();

  const swirlIntervalRef = useRef(null);
  const forgeTimeoutRef = useRef(null);
  const strikeTimeoutRef = useRef(null);
  const pendingPasswordRef = useRef('');
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const handleToggle = (setter, current) => {
    const next = !current;
    const counts = {
      uppercase: uppercase, lowercase: lowercase, numbers: numbers, symbols: symbols
    };
    const key = setter === setUppercase ? 'uppercase'
               : setter === setLowercase ? 'lowercase'
               : setter === setNumbers   ? 'numbers' : 'symbols';
    const projected = { ...counts, [key]: next };
    if (!Object.values(projected).some(Boolean)) {
      setConstraintMsg('At least one component must remain active.');
      setTimeout(() => setConstraintMsg(''), 2500);
      return;
    }
    setConstraintMsg('');
    setter(next);
  };

  const resolveForge = useCallback((password) => {
    clearInterval(swirlIntervalRef.current);
    clearTimeout(forgeTimeoutRef.current);
    clearTimeout(strikeTimeoutRef.current);
    setForgePhase('idle');
    setForgeState('resolved');
    setOutput(password);
    setSwirlDisplay('');
    if (onPasswordForged) onPasswordForged(password);
    triggerVeil(() => {});
  }, [triggerVeil, onPasswordForged]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && forgeState === 'forging') {
        resolveForge(pendingPasswordRef.current);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [forgeState, resolveForge]);

  // HIBP breach check — fires whenever a new password resolves
  useEffect(() => {
    if (forgeState !== 'resolved' || !output) return;
    let cancelled = false;
    const runCheck = async () => {
      setHibpState({ status: 'loading' });
      try {
        const { prefix, suffix } = await computeSHA1Prefix(output);
        const { data, error } = await supabase.functions.invoke('hibp-password-check', {
          body: { hashPrefix: prefix },
        });
        if (cancelled) return;
        if (error) { setHibpState({ status: 'error' }); return; }
        const lines = (data?.suffixes ?? '').trim().split('\n');
        const match = lines.find((l) => l.trim().split(':')[0].toUpperCase() === suffix);
        const breachCount = match ? parseInt(match.split(':')[1], 10) : 0;
        setHibpState({ status: 'result', ...computePasswordStrength(output, breachCount) });
      } catch {
        if (!cancelled) setHibpState({ status: 'error' });
      }
    };
    runCheck();
    return () => { cancelled = true; };
  }, [output, forgeState]);

  const handleForge = () => {
    if (forgeState === 'forging') return;
    setHibpState({ status: 'idle' });
    const components = { length, uppercase, lowercase, numbers, symbols };
    const password = forgePassword(components);
    pendingPasswordRef.current = password;

    if (prefersReduced) {
      setOutput(password);
      setForgeState('resolved');
      if (onPasswordForged) onPasswordForged(password);
      triggerVeil(() => {});
      return;
    }

    setForgePhase('swinging');
    setForgeState('forging');

    // After hammer contacts the anvil: sparks + swirl begin simultaneously
    strikeTimeoutRef.current = setTimeout(() => {
      setForgePhase('struck');
      setSwirlDisplay(Array.from({ length }, randomChar).join(''));

      swirlIntervalRef.current = setInterval(() => {
        setSwirlDisplay(Array.from({ length }, randomChar).join(''));
      }, TIMING.swirlIntervalMs);

      forgeTimeoutRef.current = setTimeout(() => {
        resolveForge(password);
      }, TIMING.swirlDurationMs);
    }, TIMING.hammerSwingMs);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      addToast('Credential copied. Guard it well.', 'info');
    });
  };

  return (
    <div className={styles.crucible}>
      <div className={styles.header}>
        <span className={styles.title}>The Grand Crucible</span>
        <span className={styles.subtitle}>Configure your Components and click Forge.</span>
      </div>

      <div className={styles.components}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Length</span>
          <input
            type="range" min={8} max={64} step={1} value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className={styles.slider}
            aria-label="Password length"
          />
          <span className={styles.sliderValue}>{length}</span>
        </div>

        {[
          { label: 'Uppercase (A–Z)', checked: uppercase, setter: setUppercase, id: 'uc' },
          { label: 'Lowercase (a–z)', checked: lowercase, setter: setLowercase, id: 'lc' },
          { label: 'Numbers (0–9)',   checked: numbers,   setter: setNumbers,   id: 'nm' },
          { label: 'Symbols (!@#$…)', checked: symbols,   setter: setSymbols,   id: 'sy' },
        ].map(({ label, checked, setter, id }) => (
          <div key={id} className={styles.checkboxRow}>
            <input type="checkbox" id={`crucible-${id}`} checked={checked}
              onChange={() => handleToggle(setter, checked)} />
            <label htmlFor={`crucible-${id}`}>{label}</label>
          </div>
        ))}

        <p className={styles.constraintMsg}>{constraintMsg}</p>
      </div>

      <div className={styles.forgeArea}>
        <ForgeAnvil
          forgePhase={forgePhase}
          onClick={handleForge}
          disabled={forgeState === 'forging'}
          swingMs={TIMING.hammerSwingMs}
          sparkMs={TIMING.sparkDurationMs}
        />
      </div>

      <div className={styles.outputRow}>
        <div className={`${styles.outputField} ${forgeState === 'forging' ? styles.forging : ''}`}>
          {forgeState === 'forging' ? (
            <span className={styles.swirlChar}>{swirlDisplay}</span>
          ) : output ? (
            <span>{output}</span>
          ) : (
            <span className={styles.placeholder}>Your forged credential will appear here.</span>
          )}
        </div>
        {output && (
          <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy credential to clipboard">
            Copy
          </button>
        )}
      </div>

      {hibpState.status !== 'idle' && (
        <div className={styles.strengthSection}>
          {hibpState.status === 'loading' && (
            <span className={styles.checking}>Checking for known breaches…</span>
          )}
          {hibpState.status === 'error' && (
            <span className={styles.unavailable}>Breach check unavailable</span>
          )}
          {hibpState.status === 'result' && (
            <>
              <div className={styles.barContainer}>
                <div className={styles.segments}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={styles.segment}
                      style={i < hibpState.score ? { background: hibpState.color } : undefined}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: hibpState.color }}>
                  {hibpState.label}
                </span>
              </div>
              {hibpState.breached ? (
                <p className={styles.breachWarn}>
                  ⚠ This password has appeared in {hibpState.breachCount.toLocaleString()} data breach{hibpState.breachCount !== 1 ? 'es' : ''} and should not be used.
                </p>
              ) : hibpState.score >= 3 ? (
                <p className={styles.clean}>✓ Not found in known data breaches.</p>
              ) : null}
              <p className={styles.attribution}>
                Breach data via{' '}
                <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer">
                  Have I Been Pwned
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
