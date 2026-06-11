/**
 * Email validation utilities for preventing invalid signups
 * Checks for common typos, short TLDs, and malformed domains
 */

export interface EmailValidationResult {
  valid: boolean;
  reason?: 'invalid_format' | 'tld_too_short' | 'common_typo' | 'domain_typo';
}

/**
 * Validates email format and checks for common typos
 */
export function validateEmail(email: string): EmailValidationResult {
  // Basic format check: something@something.something
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, reason: 'invalid_format' };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  const tld = domain.split('.').pop() || '';
  
  // TLD must have at least 2 characters (.com, .br, .io, etc.)
  if (tld.length < 2) {
    return { valid: false, reason: 'tld_too_short' };
  }
  
  // Common TLD typos - patterns that look like typos
  const tldTypoPatterns = [
    /\.comm$/,      // gmail.comm
    /\.coom$/,      // gmail.coom
    /\.con$/,       // gmail.con
    /\.cmo$/,       // gmail.cmo
    /\.om$/,        // gmail.om (but not .com)
    /\.cm$/,        // gmail.cm (but not .com)
    /\.coм$/,       // Cyrillic м instead of m
    /\.ocm$/,       // Transposed letters
    /\.xom$/,       // x instead of c
    /\.vom$/,       // v instead of c
    /\.c0m$/,       // zero instead of o
  ];
  
  for (const pattern of tldTypoPatterns) {
    if (pattern.test(domain)) {
      return { valid: false, reason: 'common_typo' };
    }
  }
  
  // Common domain name typos for popular email providers
  const domainTypoPatterns = [
    /^gmal\./,      // Missing 'i'
    /^gmial\./,     // Transposed 'ai' -> 'ia'
    /^gmil\./,      // Missing 'a'
    /^gmaill\./,    // Double 'l'
    /^gnail\./,     // 'n' instead of 'm'
    /^gamil\./,     // Transposed 'am' -> 'ma'
    /^htomail\./,   // Transposed 'ho' -> 'ot'
    /^hotmal\./,    // Missing 'i'
    /^hotmial\./,   // Transposed 'ai' -> 'ia'
    /^hotnail\./,   // 'n' instead of 'm'
    /^hotamil\./,   // Extra 'a'
    /^yaho\./,      // Missing 'o'
    /^yahooo\./,    // Extra 'o'
    /^yhaoo\./,     // Transposed
    /^outllok\./,   // Double 'l'
    /^outlok\./,    // Missing 'o'
    /^outloook\./,  // Extra 'o'
    /^iclod\./,     // Missing 'u'
    /^iclould\./,   // Extra 'l'
  ];
  
  for (const pattern of domainTypoPatterns) {
    if (pattern.test(domain)) {
      return { valid: false, reason: 'domain_typo' };
    }
  }
  
  return { valid: true };
}

/**
 * Suggests a correction for common email typos
 * Returns null if no suggestion is available
 */
export function suggestEmailCorrection(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  const corrections: Record<string, string> = {
    // TLD typos
    'gmail.comm': 'gmail.com',
    'gmail.coom': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.cmo': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmail.c': 'gmail.com',
    'hotmail.comm': 'hotmail.com',
    'hotmail.con': 'hotmail.com',
    'hotmail.cm': 'hotmail.com',
    'hotmail.c': 'hotmail.com',
    'yahoo.comm': 'yahoo.com',
    'yahoo.con': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'yahoo.c': 'yahoo.com',
    'outlook.comm': 'outlook.com',
    'outlook.con': 'outlook.com',
    'outlook.cm': 'outlook.com',
    'outlook.c': 'outlook.com',
    'icloud.comm': 'icloud.com',
    'icloud.con': 'icloud.com',
    'icloud.cm': 'icloud.com',
    'icloud.c': 'icloud.com',
    // Domain typos
    'gmal.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'htomail.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotnail.com': 'hotmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yhaoo.com': 'yahoo.com',
    'outllok.com': 'outlook.com',
    'outlok.com': 'outlook.com',
    'outloook.com': 'outlook.com',
    'iclod.com': 'icloud.com',
    'iclould.com': 'icloud.com',
  };
  
  if (corrections[domain]) {
    return email.replace(domain, corrections[domain]);
  }
  
  return null;
}
