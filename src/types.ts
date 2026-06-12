export interface Team {
  id: string;
  name: string;
  flag: string; // Emoji flag or circular badge colors
  code: string; // E.g., 'BRA'
  codigo?: string; // Two-letter ISO country code, e.g., 'BR'
}

export interface Group {
  name: string; // A to L
  teams: Team[];
}

export interface Match {
  id: string;
  group?: string; // Group A to L, or null for knockouts
  phase: 'group' | 'round16_avos' | 'round16' | 'quarter' | 'semi' | 'final'; // 'group', '32avos' (16 avos de final is round of 32 in English), 'oitavas', 'quartas', 'semi', 'final'
  teamA: Team;
  teamB: Team;
  date: string; // Date string
  time: string; // Time string
  stadium: string;
  city: string;
  // Real or simulated actual result
  scoreA?: number | null;
  scoreB?: number | null;
}

export interface Bet {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
  timestamp?: number;
}

export interface Participant {
  id: string;
  name: string;
  isCurrentUser: boolean;
  bets: { [matchId: string]: Bet };
  score: number;
}
