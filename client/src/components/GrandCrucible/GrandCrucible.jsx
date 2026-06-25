import { useState, useRef, useEffect, useCallback } from 'react';
import { usePasswords } from '../../context/PasswordContext';
import { useToast } from '../../context/ToastContext';
import { ForgeAnvil } from '../ForgeAnvil/ForgeAnvil';
import { ForgeSmoke } from '../ForgeSmoke/ForgeSmoke';
import { supabase } from '../../lib/supabaseClient';
import { computeSHA1Prefix, computePasswordStrength } from '../../lib/hibp';
import {
  HAMMER_DURATION,
  VEIL_EXPAND_DURATION,
  VEIL_HOLD_DURATION,
  VEIL_DISSIPATE_DURATION,
  SCRAMBLE_INTERVAL,
} from '../../lib/animationConstants';
import styles from './GrandCrucible.module.css';

// Characters used for the scramble animation in the output field
const SWIRL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

function randomChar() {
  return SWIRL_CHARS[Math.floor(Math.random() * SWIRL_CHARS.length)];
}

/**
 * forgePhase state machine:
 *
 *   idle
 *     ↓  (anvil click)
 *   hammer-swinging   — HAMMER_DURATION ms
 *     ↓  (hammer contacts anvil)
 *   smoke-expanding   — VEIL_EXPAND_DURATION ms (scramble + smoke expand simultaneously)
 *     ↓  (smoke fully covers screen)
 *   smoke-covered     — VEIL_HOLD_DURATION ms (scramble stops, real password placed)
 *     ↓
 *   smoke-dissipating — VEIL_DISSIPATE_DURATION ms
 *     ↓
 *   resolved          — password visible, HIBP check fires
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
  const [swirlDisplay, setSwirlDisplay] = useState('');
  const [hibpState, setHibpState] = useState({ status: 'idle' });

  const { forgePassword } = usePasswords();
  const { addToast } = useToast();

  const swirlIntervalRef  = useRef(null);
  const timersRef         = useRef([]);
  const pendingPasswordRef = useRef('');

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Clear all pending timeouts (used on Escape / cancel)
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    clearInterval(swirlIntervalRef.current);
    swirlIntervalRef.current = null;
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

  // Jump straight to covered state (Escape pressed during expansion)
  const skipToResolved = useCallback(() => {
    clearTimers();
    setForgePhase('smoke-covered');
    setOutput(pendingPasswordRef.current);
    setSwirlDisplay('');
    if (onPasswordForged) onPasswordForged(pendingPasswordRef.current);

    schedule(() => {
      setForgePhase('smoke-dissipating');
      schedule(() => {
        setForgePhase('resolved');
      }, VEIL_DISSIPATE_DURATION);
    }, VEIL_HOLD_DURATION);
  }, [clearTimers, onPasswordForged]);

  // Escape cancels the forge mid-expansion
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

  const handleAnvilClick = () => {
    // Prevent re-triggering while any animation is in progress
    if (forgePhase !== 'idle' && forgePhase !== 'resolved') return;

    setHibpState({ status: 'idle' });
    const password = forgePassword({ length, uppercase, lowercase, numbers, symbols });
    pendingPasswordRef.current = password;

    // Reduced-motion: skip all animation, show password immediately
    if (prefersReduced) {
      setOutput(password);
      setForgePhase('resolved');
      if (onPasswordForged) onPasswordForged(password);
      return;
    }

    // ── Phase 1: Hammer swings ──────────────────────────────────────────
    setForgePhase('hammer-swinging');

    schedule(() => {
      // ── Phase 2: Hammer contacts — smoke, sparks, scramble all start ──
      setForgePhase('smoke-expanding');

      // Scramble characters in the output field while smoke expands
      setSwirlDisplay(Array.from({ length }, randomChar).join(''));
      swirlIntervalRef.current = setInterval(() => {
        setSwirlDisplay(Array.from({ length }, randomChar).join(''));
      }, SCRAMBLE_INTERVAL);

      schedule(() => {
        // ── Phase 3: Smoke fully covers screen ─────────────────────────
        clearInterval(swirlIntervalRef.current);
        swirlIntervalRef.current = null;
        setSwirlDisplay('');
        setOutput(password);
        setForgePhase('smoke-covered');
        if (onPasswordForged) onPasswordForged(password);

        schedule(() => {
          // ── Phase 4: Smoke dissipates ───────────────────────────────
          setForgePhase('smoke-dissipating');

          schedule(() => {
            // ── Phase 5: Resolved — password is now visible ────────────
            setForgePhase('resolved');
          }, VEIL_DISSIPATE_DURATION);
        }, VEIL_HOLD_DURATION);
      }, VEIL_EXPAND_DURATION);
    }, HAMMER_DURATION);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      addToast('Credential copied. Guard it well.', 'info');
    });
  };

  // Which output content to show based on phase
  const smokePhasesActive = ['smoke-expanding', 'smoke-covered', 'smoke-dissipating'];
  const showScramble = forgePhase === 'smoke-expanding';
  const showOutput   = output && !showScramble;

  // ForgeSmoke receives its own phase subset
  const smokePhaseMap = {
    'smoke-expanding':   'expanding',
    'smoke-covered':     'covered',
    'smoke-dissipating': 'dissipating',
  };
  const smokePhase = smokePhaseMap[forgePhase] ?? 'idle';

  const anvilDisabled = smokePhasesActive.includes(forgePhase);

  return (
    <div className={styles.crucible}>
      <div className={styles.header}>
        <span className={styles.title}>The Grand Crucible</span>
        <span className={styles.subtitle}>Configure your Components, then strike the anvil to Forge.</span>
      </div>

      {/* Anvil + hammer — replaces the old Forge button */}
      <div className={styles.anvilRow}>
        <ForgeAnvil
          onStrike={handleAnvilClick}
          swinging={forgePhase === 'hammer-swinging'}
          disabled={anvilDisabled}
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

      <div className={styles.outputRow}>
        <div className={`${styles.outputField} ${showScramble ? styles.forging : ''}`}>
          {showScramble ? (
            <span className={styles.swirlChar}>{swirlDisplay}</span>
          ) : showOutput ? (
            <span>{output}</span>
          ) : (
            <span className={styles.placeholder}>Your forged credential will appear here.</span>
          )}
        </div>
        {output && forgePhase === 'resolved' && (
          <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy credential to clipboard">
            Copy
          </button>
        )}
      </div>

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
