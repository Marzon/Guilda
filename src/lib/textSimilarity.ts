/**
 * Calculate similarity between two strings using normalized Levenshtein distance
 * Returns a value between 0 and 1, where 1 means identical
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
}

function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Use two rows instead of full matrix for memory efficiency
  let prevRow = new Array(len2 + 1);
  let currRow = new Array(len2 + 1);
  
  for (let j = 0; j <= len2; j++) {
    prevRow[j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    currRow[0] = i;
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[len2];
}

/**
 * Check if two messages are similar (>80% similarity)
 */
export function isSimilarMessage(msg1: string, msg2: string, threshold = 0.8): boolean {
  return calculateSimilarity(msg1, msg2) >= threshold;
}

/**
 * Find the most similar message from a list
 * Returns the message and its similarity score, or null if none above threshold
 */
export function findSimilarMessage(
  content: string,
  history: { content: string; created_at: string }[],
  threshold = 0.8
): { content: string; created_at: string; similarity: number } | null {
  let bestMatch: { content: string; created_at: string; similarity: number } | null = null;
  
  for (const msg of history) {
    const similarity = calculateSimilarity(content, msg.content);
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { ...msg, similarity };
    }
  }
  
  return bestMatch;
}
