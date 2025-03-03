export interface User {
  id: string;
  username: string;
  role: 'editor' | 'user' | 'admin';
  avatar?: string;
  bio?: string;
  successRate?: number;
}

export interface Prediction {
  id: string;
  authorId: string;
  title: string;
  content: string;
  match: {
    homeTeam: string;
    awayTeam: string;
    date: Date;
    league: string;
  };
  prediction: string;
  odds: number;
  createdAt: Date;
  status: 'pending' | 'won' | 'lost';
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: Date;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  category: 'analysis' | 'news' | 'column';
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  membershipType: 'free' | 'premium' | 'vip';
  avatar?: string;
  bio?: string;
  successRate?: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LiveScore {
  id: string;
  homeTeam: {
    name: string;
    score: number;
    redCards: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    redCards: number;
    logo?: string;
  };
  minute: number;
  league: string;
  status: 'live' | 'finished' | 'not_started';
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'red_card' | 'yellow_card' | 'substitution' | 'other';
  minute: number;
  team: 'home' | 'away';
  playerName: string;
}

// Yeni API için ek tipler
export interface FootballDataMatch {
  id: number;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
  stage: string;
  minute?: number;
  competition: {
    id: number;
    name: string;
  };
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
    redCards?: {
      home: number;
      away: number;
    };
  };
}

export interface TeamStanding {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface LeagueStandings {
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  standings: {
    stage: string;
    type: string;
    table: TeamStanding[];
  }[];
}

export interface MatchStats {
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  possession: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
}

export interface MatchLineup {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  formation: string;
  startingXI: {
    id: number;
    name: string;
    number: number;
    position: string;
    shirtNumber?: number;
    role?: string;
  }[];
  substitutes: {
    id: number;
    name: string;
    number: number;
    position: string;
    shirtNumber?: number;
    role?: string;
  }[];
  coach: {
    id: number;
    name: string;
    photo?: string;
    nationality?: string;
  };
}

export interface HeadToHead {
  id: string;
  date: string;
  homeTeam: {
    id: number;
    name: string;
    score: number;
  };
  awayTeam: {
    id: number;
    name: string;
    score: number;
  };
  competition: {
    id: number;
    name: string;
  };
}

export interface MatchDetail extends LiveScore {
  venue: {
    id: number;
    name: string;
    city: string;
  };
  referee: {
    id: number;
    name: string;
    nationality: string;
  };
  stats: MatchStats;
  lineups: {
    home: MatchLineup;
    away: MatchLineup;
  };
  h2h: HeadToHead[];
} 