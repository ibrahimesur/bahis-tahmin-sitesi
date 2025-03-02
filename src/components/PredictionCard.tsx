import { User } from '../types';
import Link from 'next/link';

interface PredictionCardProps {
  prediction: {
    id: string;
    author: string;
    time: string;
    isPremium: boolean;
    match: {
      homeTeam: string;
      awayTeam: string;
      league: string;
      time: string;
    };
    content: string;
    prediction: string;
    odds: number;
    comments: number;
  };
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-medium">{prediction.author}</span>
          <span className="text-gray-500 text-sm ml-2">{prediction.time}</span>
        </div>
        {prediction.isPremium && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Premium
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="font-medium mb-1">
          {prediction.match.homeTeam} vs {prediction.match.awayTeam}
        </div>
        <div className="text-sm text-gray-600">
          {prediction.match.league} • {prediction.match.time}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{prediction.content}</p>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">Tahmin:</div>
          <div className="font-medium">{prediction.prediction}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Oran:</div>
          <div className="font-medium">{prediction.odds}</div>
        </div>
      </div>

      <div className="flex items-center mt-4 pt-4 border-t">
        <button className="text-gray-600 hover:text-gray-800 text-sm">
          💬 Yorumlar ({prediction.comments})
        </button>
        <button className="text-gray-600 hover:text-gray-800 text-sm ml-4">
          📊 İstatistikler
        </button>
        <button className="text-blue-600 hover:text-blue-800 text-sm ml-auto">
          Detaylar
        </button>
      </div>
    </div>
  );
} 