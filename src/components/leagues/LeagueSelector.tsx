import { useState } from 'react';
import Image from 'next/image';

export default function LeagueSelector() {
  const [searchTerm, setSearchTerm] = useState('');

  const leagues = [
    { 
      id: 'PL', 
      name: 'Premier League', 
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png'
    },
    { 
      id: 'PD', 
      name: 'LaLiga', 
      country: 'Spain',
      logo: 'https://media.api-sports.io/football/leagues/140.png'
    },
    { 
      id: 'SA', 
      name: 'Serie A', 
      country: 'Italy',
      logo: 'https://media.api-sports.io/football/leagues/135.png'
    },
    { 
      id: 'BL1', 
      name: 'Bundesliga', 
      country: 'Germany',
      logo: 'https://media.api-sports.io/football/leagues/78.png'
    },
    { 
      id: 'FL1', 
      name: 'Ligue 1', 
      country: 'France',
      logo: 'https://media.api-sports.io/football/leagues/61.png'
    },
    { 
      id: 'CL', 
      name: 'UEFA Champions League', 
      country: 'Europe',
      logo: 'https://media.api-sports.io/football/leagues/2.png'
    },
    { 
      id: 'EL', 
      name: 'UEFA Europa League', 
      country: 'Europe',
      logo: 'https://media.api-sports.io/football/leagues/3.png'
    },
    { 
      id: 'PPL', 
      name: 'Primeira Liga', 
      country: 'Portugal',
      logo: 'https://media.api-sports.io/football/leagues/94.png'
    },
    { 
      id: 'DED', 
      name: 'Eredivisie', 
      country: 'Netherlands',
      logo: 'https://media.api-sports.io/football/leagues/88.png'
    },
    { 
      id: 'TR1', 
      name: 'Süper Lig', 
      country: 'Turkey',
      logo: 'https://media.api-sports.io/football/leagues/203.png'
    }
  ];

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4">
        <input
          type="text"
          placeholder="Lig ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredLeagues.map((league) => (
          <button
            key={league.id}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="w-8 h-8 flex-shrink-0 relative">
              <Image
                src={league.logo}
                alt={league.name}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{league.name}</div>
              <div className="text-sm text-gray-500">{league.country}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 