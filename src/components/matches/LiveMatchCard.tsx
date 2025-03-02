import Link from 'next/link';
import Image from 'next/image';
import { LiveScore } from '../../types';

interface LiveMatchCardProps {
  match: LiveScore;
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          {/* Lig Başlığı */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-600">{match.league}</span>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
              {match.minute}'
            </span>
          </div>

          {/* Takımlar ve Skor */}
          <div className="grid grid-cols-7 gap-2 items-center">
            {/* Ev Sahibi */}
            <div className="col-span-3 flex items-center space-x-2">
              <div className="w-8 h-8 relative flex-shrink-0">
                {match.homeTeam.logo ? (
                  <Image
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
              </div>
              <span className="font-medium truncate">{match.homeTeam.name}</span>
            </div>

            {/* Skor */}
            <div className="col-span-1 text-center">
              <div className="text-lg font-bold">
                {match.homeTeam.score} - {match.awayTeam.score}
              </div>
            </div>

            {/* Deplasman */}
            <div className="col-span-3 flex items-center justify-end space-x-2">
              <span className="font-medium truncate">{match.awayTeam.name}</span>
              <div className="w-8 h-8 relative flex-shrink-0">
                {match.awayTeam.logo ? (
                  <Image
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Kırmızı Kart Gösterimi */}
          {(match.homeTeam.redCards > 0 || match.awayTeam.redCards > 0) && (
            <div className="mt-2 flex justify-between text-xs text-red-600">
              <span>{match.homeTeam.redCards > 0 ? '🟥'.repeat(match.homeTeam.redCards) : ''}</span>
              <span>{match.awayTeam.redCards > 0 ? '🟥'.repeat(match.awayTeam.redCards) : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 