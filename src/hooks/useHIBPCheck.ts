import { useState, useCallback } from 'react';

/**
 * Check if a password has been exposed in data breaches using the HIBP API.
 * Uses k-anonymity: only sends first 5 chars of SHA-1 hash to preserve privacy.
 */
async function checkPasswordBreached(password: string): Promise<{ breached: boolean; count: number }> {
  // Generate SHA-1 hash of password
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  // Split hash for k-anonymity (only send first 5 chars)
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent response length analysis
      },
    });
    
    if (!response.ok) {
      console.warn('HIBP API request failed:', response.status);
      return { breached: false, count: 0 }; // Fail open - don't block user
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix?.trim() === suffix) {
        const count = parseInt(countStr?.trim() || '0', 10);
        return { breached: true, count };
      }
    }
    
    return { breached: false, count: 0 };
  } catch (error) {
    console.warn('HIBP check failed:', error);
    return { breached: false, count: 0 }; // Fail open
  }
}

export interface HIBPCheckResult {
  isChecking: boolean;
  isBreached: boolean | null;
  breachCount: number;
  checkPassword: (password: string) => Promise<{ breached: boolean; count: number }>;
  reset: () => void;
}

export function useHIBPCheck(): HIBPCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isBreached, setIsBreached] = useState<boolean | null>(null);
  const [breachCount, setBreachCount] = useState(0);

  const checkPassword = useCallback(async (password: string) => {
    if (!password || password.length < 6) {
      return { breached: false, count: 0 };
    }
    
    setIsChecking(true);
    try {
      const result = await checkPasswordBreached(password);
      setIsBreached(result.breached);
      setBreachCount(result.count);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsBreached(null);
    setBreachCount(0);
  }, []);

  return {
    isChecking,
    isBreached,
    breachCount,
    checkPassword,
    reset,
  };
}
