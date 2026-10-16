import { JournalEntry } from '../lib/supabase';

interface EmotionalChartProps {
  entries: JournalEntry[];
}

export function EmotionalChart({ entries }: EmotionalChartProps) {
  const maxScore = Math.max(...entries.map(e => Math.abs(e.sentiment_score)), 1);

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const date = new Date(entry.entry_date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const percentage = (Math.abs(entry.sentiment_score) / maxScore) * 100;
        const isPositive = entry.sentiment_score > 0;
        const isNeutral = entry.sentiment === 'neutral';

        return (
          <div key={entry.id} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400 text-right">
              <div className="font-medium">{dayName}</div>
              <div className="text-xs">{dateStr}</div>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-8 flex items-center overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isNeutral
                      ? 'bg-blue-400'
                      : isPositive
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : 'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-16 text-right">
                <span
                  className={`text-sm font-medium ${
                    isNeutral
                      ? 'text-blue-600 dark:text-blue-400'
                      : isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {isNeutral ? 'Neutral' : isPositive ? 'Good' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Challenging</span>
          </div>
        </div>
      </div>
    </div>
  );
}
