/**
 * Yono Transparency - Proof-of-Work Utility
 * Handles the client-side solving of SHA-256 challenges.
 */

export const solveChallenge = async (
  nonce: string, 
  difficulty: string, 
  maxIterations: number = 5000000
): Promise<number> => {
  let counter = 0;
  const encoder = new TextEncoder();
  
  while (counter < maxIterations) {
    const msg = encoder.encode(nonce + counter);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msg);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex.startsWith(difficulty)) {
      return counter;
    }
    counter++;
  }
  
  throw new Error('Mathematical limit exceeded: Challenge too difficult or timeout.');
};

/**
 * Validates a solution locally before sending (optional optimization)
 */
export const verifySolutionLocally = async (
  nonce: string, 
  solution: number, 
  difficulty: string
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const msg = encoder.encode(nonce + solution);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msg);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.startsWith(difficulty);
};
