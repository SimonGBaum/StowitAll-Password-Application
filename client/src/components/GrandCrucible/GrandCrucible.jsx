import { useState, useRef, useEffect, useCallback } from 'react';
import { usePasswords } from '../../context/PasswordContext';
import { useToast } from '../../context/ToastContext';
import { ForgeAnvil } from '../ForgeAnvil/ForgeAnvil';
import { ForgeSmoke } from '../ForgeSmoke/ForgeSmoke';
import { supabase } from '../../lib/supabaseClient';
import { computeSHA1Prefix, computePasswordStrength } from '../../lib/hibp';
import {
  VEIL_EXPAND_DURATION,
  VEIL_HOLD_DURATION,
  VEIL_DISSIPATE_DURATION,
} from '../../lib/animationConstants';
import styles from './GrandCrucible.module.css';

/**
 * forgePhase state machine:
 *
 *   idle
 *     ↓  (anvil click → handleForge called)
 *   smoke-expanding   — VEIL_EXPAND_DURATION ms
 *     ↓
 *   smoke-covered     — VEIL_HOLD_DURATION ms
 *     ↓
 *   smoke-dissipating — VEIL_DISSIPATE_DURATION ms
 *     ↓
 *   resolved          — password visible, HIBP check fires
 *
 * ForgeAnvil owns hammer / spark / scramble / output display internally.
 * GrandCrucible owns ForgeSmoke, HIBP, copy button, and form controls.
 */
export function GrandCrucible({ onPasswordForged }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [constraintMsg, setConstraintMsg] = useState('');

  const [forgePhase, setForgePhase] = useState('idle');
  const [output, setOutput] = useState('');
  const [hibpState, setHibpState] = useState({ status: 'idle' });

  const { forgePassword } = usePasswords();
  const { addToast } = useToast();

  const timersRef = useRef([]);
  const pendingPasswordRef = useRef('');

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const handleToggle = (setter, current) => {
    const next = !current;
    const counts = { uppercase, lowercase, numbers, symbols };
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

  // Escape cancels the forge mid-expansion
  const skipToResolved = useCallback(() => {
    clearTimers();
    setForgePhase('smoke-covered');
    setOutput(pendingPasswordRef.current);
    if (onPasswordForged) onPasswordForged(pendingPasswordRef.current);

    schedule(() => {
      setForgePhase('smoke-dissipating');
      schedule(() => {
        setForgePhase('resolved');
      }, VEIL_DISSIPATE_DURATION);
    }, VEIL_HOLD_DURATION);
  }, [clearTimers, onPasswordForged]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && forgePhase === 'smoke-expanding') {
        skipToResolved();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [forgePhase, skipToResolved]);

  // HIBP breach check — fires once a password is in the resolved state
  useEffect(() => {
    if (forgePhase !== 'resolved' || !output) return;
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
  }, [output, forgePhase]);

  // Called by ForgeAnvil at impact — returns the new password so ForgeAnvil
  // can display it in its own scramble/output field.
  const handleForge = useCallback(async () => {
    setHibpState({ status: 'idle' });
    const password = forgePassword({ length, uppercase, lowercase, numbers, symbols });
    pendingPasswordRef.current = password;

    if (prefersReduced) {
      setOutput(password);
      setForgePhase('resolved');
      if (onPasswordForged) onPasswordForged(password);
      return password;
    }

    setForgePhase('smoke-expanding');

    schedule(() => {
      setForgePhase('smoke-covered');
      setOutput(password);
      if (onPasswordForged) onPasswordForged(password);

      schedule(() => {
        setForgePhase('smoke-dissipating');
        schedule(() => {
          setForgePhase('resolved');
        }, VEIL_DISSIPATE_DURATION);
      }, VEIL_HOLD_DURATION);
    }, VEIL_EXPAND_DURATION);

    return password;
  }, [forgePassword, length, uppercase, lowercase, numbers, symbols, prefersReduced, onPasswordForged]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      addToast('Credential copied. Guard it well.', 'info');
    });
  };

  const smokePhaseMap = {
    'smoke-expanding':   'expanding',
    'smoke-covered':     'covered',
    'smoke-dissipating': 'dissipating',
  };
  const smokePhase = smokePhaseMap[forgePhase] ?? 'idle';

  return (
    <div className={styles.crucible}>
      <div className={styles.header}>
        <span className={styles.title}>The Grand Crucible</span>
        <span className={styles.subtitle}>Configure your Components, then strike the anvil to Forge.</span>
      </div>

      {/* ForgeAnvil — owns hammer, sparks, scramble, and output display */}
      <div className={styles.anvilRow}>
        <ForgeAnvil
          onForge={handleForge}
          passwordLength={length}
        />
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

      {/* Copy button — shown after forge resolves */}
      {output && forgePhase === 'resolved' && (
        <div className={styles.outputRow}>
          <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy credential to clipboard">
            Copy
          </button>
        </div>
      )}

      {hibpState.status !== 'idle' && forgePhase === 'resolved' && (
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

      {/* Forge smoke overlay — covers the full viewport via position:fixed */}
      <ForgeSmoke phase={smokePhase} />
    </div>
  );
}
