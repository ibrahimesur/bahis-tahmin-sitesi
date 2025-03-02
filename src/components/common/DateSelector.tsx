import { useState } from 'react';

export default function DateSelector() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sonraki 7 günü oluştur
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      return date.toLocaleDateString('tr-TR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="flex overflow-x-auto py-4 px-2 space-x-2">
      {dates.map((date) => (
        <button
          key={date.toISOString()}
          onClick={() => setSelectedDate(date)}
          className={`flex flex-col items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            date.toDateString() === selectedDate.toDateString()
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-sm font-medium">{formatDate(date)}</span>
          <span className="text-xs text-gray-500">
            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric' })}
          </span>
        </button>
      ))}
    </div>
  );
} 