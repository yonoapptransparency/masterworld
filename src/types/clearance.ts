/**
 * Yono Transparency - Clearance Flow Types
 */

export type ClearancePhase = 'idle' | 'handshake' | 'solving' | 'ready' | 'error';

export interface ChallengeResponse {
  nonce: string;
  difficulty: string;
  sid: string;
}

export interface VerificationResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface ClearanceState {
  phase: ClearancePhase;
  progress: number;
  errorMsg: string;
  token: string | null;
  dynamicLink: string | null;
  sid: string | null;
  tokenCountdown: number;
}
