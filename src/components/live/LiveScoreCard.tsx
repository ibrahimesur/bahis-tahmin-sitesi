import { LiveScore } from '../../types';

interface LiveScoreCardProps {
  match: LiveScore;
}

export default function LiveScoreCard({ match }: LiveScoreCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{match.league}</span>
        <span className="text-sm font-semibold text-red-600">
          {match.status === 'live' ? `${match.minute}'` : match.status}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-semibold">{match.homeTeam.name}</span>
            {match.homeTeam.redCards > 0 && (
              <span className="ml-2 text-red-600">
                {Array(match.homeTeam.redCards).fill('🟥').join('')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mx-4">
          <span className="text-2xl font-bold">{match.homeTeam.score}</span>
          <span className="text-gray-400">-</span>
          <span className="text-2xl font-bold">{match.awayTeam.score}</span>
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-end">
            <span className="font-semibold">{match.awayTeam.name}</span>
            {match.awayTeam.redCards > 0 && (
              <span className="ml-2 text-red-600">
                {Array(match.awayTeam.redCards).fill('🟥').join('')}
              </span>
            )}
          </div>
        </div>
      </div>

      {match.events.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-1">
            {match.events.map((event) => (
              <div key={event.id} className="text-sm text-gray-600 flex items-center">
                <span className="w-8">{event.minute}'</span>
                <span className="mr-2">
                  {event.type === 'goal' && '⚽'}
                  {event.type === 'red_card' && '🟥'}
                  {event.type === 'yellow_card' && '🟨'}
                  {event.type === 'substitution' && '🔄'}
                </span>
                <span>{event.playerName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 