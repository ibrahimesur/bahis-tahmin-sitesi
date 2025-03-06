import { TeamStanding } from '../../types';
import Image from 'next/image';

interface StandingsTableProps {
  standings: TeamStanding[];
  title: string;
}

export default function StandingsTable({ standings, title }: StandingsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Takım
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                O
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                G
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                B
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                M
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                A
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Y
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Av
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                P
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((team) => (
              <tr key={team.team.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {team.position}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 relative">
                      {team.team.crest && (
                        <Image
                          src={team.team.crest}
                          alt={team.team.name}
                          width={32}
                          height={32}
                          className="object-contain"
                          sizes="32px"
                        />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {team.team.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.playedGames}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.won}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.draw}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.lost}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.goalsFor}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.goalsAgainst}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {team.goalDifference}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold">
                  {team.points}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  <div className="flex space-x-1 justify-center">
                    {team.form && team.form.split('').map((result, index) => (
                      <span
                        key={index}
                        className={`inline-block w-4 h-4 rounded-full text-xs flex items-center justify-center text-white ${
                          result === 'W' ? 'bg-green-500' : 
                          result === 'D' ? 'bg-yellow-500' : 
                          result === 'L' ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                      >
                        {result === 'W' ? 'G' : result === 'D' ? 'B' : result === 'L' ? 'M' : '?'}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 