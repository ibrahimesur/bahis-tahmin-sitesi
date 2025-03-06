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
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm?: string;
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
  date?: string;
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

// API-Football için tip tanımlamaları
export interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
  events?: ApiFootballEvent[];
  lineups?: ApiFootballLineup[];
  statistics?: ApiFootballStatistics[];
}

export interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  coach: {
    id: number;
    name: string;
    photo: string;
  };
  formation: string;
  startXI: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string;
    };
  }[];
  substitutes: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }[];
}

export interface ApiFootballStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: {
    type: string;
    value: number | string | null;
  }[];
}

export interface ApiFootballStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: {
      rank: number;
      team: {
        id: number;
        name: string;
        logo: string;
      };
      points: number;
      goalsDiff: number;
      group: string;
      form: string;
      status: string;
      description: string | null;
      all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: {
          for: number;
          against: number;
        };
      };
      home: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: {
          for: number;
          against: number;
        };
      };
      away: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: {
          for: number;
          against: number;
        };
      };
      update: string;
    }[][];
  };
} 