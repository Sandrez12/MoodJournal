import { useState } from 'react';
import { Smile, Frown, Meh, Calendar, Trash2 } from 'lucide-react';
import { JournalEntry } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface EntryCardProps {
  entry: JournalEntry;
  onDelete?: () => void;
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting entry:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>
          {onDelete && (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-800 mb-3 leading-relaxed">{entry.content}</p>

      {entry.ai_summary && (
        <div className={`${config.bg} border-l-4 border-${entry.sentiment === 'positive' ? 'green' : entry.sentiment === 'negative' ? 'orange' : 'blue'}-500 p-3 rounded`}>
          <p className={`text-sm ${config.color} font-medium mb-1`}>AI Insight</p>
          <p className="text-sm text-gray-700">{entry.ai_summary}</p>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Entry?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
