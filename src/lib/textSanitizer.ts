/**
 * Masks phone numbers in text to prevent users from bypassing the premium contact system.
 * Detects various phone number formats and replaces them with a placeholder.
 * 
 * Detects:
 * - Sequences of 8+ consecutive digits
 * - Brazilian format: (XX) XXXXX-XXXX
 * - International format: +55 XX XXXXX-XXXX
 * - Spaced/hyphenated numbers: XX XXXX XXXX or XX-XXXX-XXXX
 */
export function maskPhoneNumbers(text: string | null | undefined, placeholder: string = "[hidden contact]"): string {
  if (!text) return "";
  
  let result = text;
  
  // Pattern 1: International format with + (e.g., +55 47 999687718)
  result = result.replace(/\+\d{1,3}[\s.-]?\d{2,3}[\s.-]?\d{4,5}[\s.-]?\d{4}/g, placeholder);
  
  // Pattern 2: Brazilian format with parentheses (e.g., (47) 99968-7718)
  result = result.replace(/\(\d{2,3}\)\s?\d{4,5}[-.\s]?\d{4}/g, placeholder);
  
  // Pattern 3: Sequences of 8+ digits possibly with separators
  // This catches: 47999687718, 47 99968 7718, 47-9996-87718
  result = result.replace(/\d[\d\s.-]{7,}\d/g, (match) => {
    // Count actual digits
    const digits = match.replace(/\D/g, '');
    // Only mask if it looks like a phone number (8-15 digits)
    if (digits.length >= 8 && digits.length <= 15) {
      return placeholder;
    }
    return match;
  });
  
  return result;
}

/**
 * Checks if text contains what appears to be a phone number
 */
export function containsPhoneNumber(text: string | null | undefined): boolean {
  if (!text) return false;
  return maskPhoneNumbers(text, "MASKED") !== text;
}
