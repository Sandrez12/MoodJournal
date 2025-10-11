import { Smile, Frown, Meh, Calendar } from 'lucide-react';
import { JournalEntry } from '../lib/supabase';

interface EntryCardProps {
  entry: JournalEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const sentimentConfig = {
    positive: {
      icon: Smile,
      color: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Positive',
    },
    negative: {
      icon: Frown,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      label: 'Challenging',
    },
    neutral: {
      icon: Meh,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      label: 'Neutral',
    },
  };

  const config = sentimentConfig[entry.sentiment];
  const Icon = config.icon;
  const date = new Date(entry.entry_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {formattedDate}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <p className="text-gray-800 mb-3 leading-relaxed">{entry.content}</p>

      {entry.ai_summary && (
        <div className={`${config.bg} border-l-4 border-${entry.sentiment === 'positive' ? 'green' : entry.sentiment === 'negative' ? 'orange' : 'blue'}-500 p-3 rounded`}>
          <p className={`text-sm ${config.color} font-medium mb-1`}>AI Insight</p>
          <p className="text-sm text-gray-700">{entry.ai_summary}</p>
        </div>
      )}
    </div>
  );
}
