// Auth Types
export type LoginRequest = {
  username?: string; // Made optional to match UserDTO for /api/users/login
  password?: string; // Made optional to match UserDTO for /api/users/login
  email?: string; // For UserDTO based login/registration
};

export type AuthResponse = {
  token: string;
  message?: string;
  error?: string;
  details?: string;
};

export type RegisterResponse = {
  message: string;
  verificationToken?: string; // Optional as it's for success cases
  error?: string;
};

// User Types
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN'; // Assuming roles are simple strings
  verified: boolean;
  // Add other fields if returned by /me or needed by frontend
};

export type UserDTO = { // For /me response
  username: string;
  email: string;
};

// Election Types
export type Election = {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  active: boolean;
  // Optional fields that might be populated based on context
  candidates?: Candidate[];
  results?: ElectionResults;
};

export type Candidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  biography?: string;
  imageUrl?: string;
  electionId?: string; // If relevant for some contexts
  voteCount?: number; // For results display
};

export type CandidateDTO = { // For adding/updating candidate
  name: string;
  party: string;
  position: string;
  biography?: string;
  imageUrl?: string;
};

export type CandidateResult = {
  candidateId: string;
  candidateName: string;
  voteCount: number;
};

export type ElectionResults = {
  electionId: string;
  results: Record<string, number>; // CandidateId to VoteCount map
  // OR candidateResults: CandidateResult[]; if backend structures it this way
  totalVotes: number;
  winner?: string; // Candidate name or ID
};

// Vote Types
export type VoteDTO = {
  electionId: string;
  candidateId: string;
};

export type EligibilityStatus = {
  eligible: boolean;
  hasVoted: boolean;
};

export type VoteStatus = EligibilityStatus; // Alias

// Generic API Response
export type ApiResponse = {
  success: boolean;
  message: string;
  // Optional data field for responses carrying more than just a message
  data?: any; 
};

// Blockchain Types
export type BlockchainStatus = {
  valid: boolean;
  pendingTransactions: number;
  blockCount: number;
};

// Voter Insights AI Flow Types (already defined in src/ai/flows/voter-insights-flow.ts)
// Re-exporting them here for consistency if needed, or import directly from the flow file.
export type { VoterInsightsInput, VoterInsightsOutput } from '@/ai/flows/voter-insights-flow';
