export async function computeSHA1Prefix(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoded);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return { prefix: hex.slice(0, 5), suffix: hex.slice(5) };
}

export function computePasswordStrength(password, breachCount) {
  if (breachCount > 0) {
    return {
      score: 0,
      label: 'Compromised',
      color: 'var(--color-accent-error)',
      breached: true,
      breachCount,
      entropyBits: 0,
    };
  }

  const hasLower  = /[a-z]/.test(password);
  const hasUpper  = /[A-Z]/.test(password);
  const hasDigit  = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const charsetSize =
    (hasLower  ? 26 : 0) +
    (hasUpper  ? 26 : 0) +
    (hasDigit  ? 10 : 0) +
    (hasSymbol ? 32 : 0);

  const entropyBits = charsetSize > 0 ? Math.log2(charsetSize) * password.length : 0;

  let score, label, color;
  if      (entropyBits < 28)  { score = 0; label = 'Very Weak';   color = 'var(--color-accent-error)'; }
  else if (entropyBits < 36)  { score = 1; label = 'Weak';        color = 'var(--color-strength-weak)'; }
  else if (entropyBits < 60)  { score = 2; label = 'Fair';        color = 'var(--color-strength-fair)'; }
  else if (entropyBits < 128) { score = 3; label = 'Strong';      color = 'var(--color-glow-safe)'; }
  else                        { score = 4; label = 'Very Strong'; color = 'var(--color-glow-safe)'; }

  return { score, label, color, breached: false, breachCount: 0, entropyBits };
}
