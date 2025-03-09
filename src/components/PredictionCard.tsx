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
    likes: number;
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
        <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {prediction.likes}
        </button>
        <button className="text-gray-600 hover:text-gray-800 text-sm ml-4">
          💬 Yorumlar ({prediction.comments})
        </button>
        <button className="text-blue-600 hover:text-blue-800 text-sm ml-auto">
          Detaylar
        </button>
      </div>
    </div>
  );
} 