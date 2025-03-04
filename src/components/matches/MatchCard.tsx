import { LiveScore } from '../../types';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface MatchCardProps {
  match: LiveScore;
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();

  const getStatusText = (status: LiveScore['status']) => {
    switch (status) {
      case 'live':
        return `${match.minute}'`;
      case 'finished':
        return 'Tamamlandı';
      case 'not_started':
        return 'Başlamadı';
      default:
        return status;
    }
  };

  const getStatusColor = (status: LiveScore['status']) => {
    switch (status) {
      case 'live':
        return 'text-red-600';
      case 'finished':
        return 'text-gray-600';
      case 'not_started':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Maç saatini formatla
  const formatMatchTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/matches/${match.id}`)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{match.league}</span>
        <span className={`text-sm font-semibold ${getStatusColor(match.status)}`}>
          {getStatusText(match.status)}
          {match.status === 'not_started' && match.date && (
            <span className="ml-2 text-gray-500">{formatMatchTime(match.date)}</span>
          )}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center">
            {match.homeTeam.logo && (
              <div className="w-8 h-8 mr-2 relative">
                <Image
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="font-semibold">{match.homeTeam.name}</span>
            {match.homeTeam.redCards > 0 && (
              <span className="ml-2 text-red-600">
                {Array(match.homeTeam.redCards).fill('🟥').join('')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mx-4">
          <span className={`text-2xl font-bold ${match.status === 'live' ? 'text-blue-600' : ''}`}>
            {match.homeTeam.score}
          </span>
          <span className="text-gray-400">-</span>
          <span className={`text-2xl font-bold ${match.status === 'live' ? 'text-blue-600' : ''}`}>
            {match.awayTeam.score}
          </span>
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-end">
            <span className="font-semibold">{match.awayTeam.name}</span>
            {match.awayTeam.logo && (
              <div className="w-8 h-8 ml-2 relative">
                <Image
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
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