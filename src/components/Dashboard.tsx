import { useEffect, useState } from 'react';
import { Smile, Frown, Meh, Calendar, TrendingUp, LogOut, Sparkles } from 'lucide-react';
import { supabase, JournalEntry, MotivationalQuote } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry as JournalEntryComponent } from './JournalEntry';
import { EntryCard } from './EntryCard';
import { StatCard } from './StatCard';
import { EmotionalChart } from './EmotionalChart';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const { data: entriesData } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user!.id)
      .order('entry_date', { ascending: false })
      .limit(30);

    if (entriesData) {
      setEntries(entriesData);

      const latestSentiment = entriesData[0]?.sentiment || 'all';

      const { data: quotes } = await supabase
        .from('motivational_quotes')
        .select('*')
        .or(`sentiment_type.eq.${latestSentiment},sentiment_type.eq.all`)
        .limit(10);

      if (quotes && quotes.length > 0) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stats = {
    total: entries.length,
    positive: entries.filter(e => e.sentiment === 'positive').length,
    negative: entries.filter(e => e.sentiment === 'negative').length,
    neutral: entries.filter(e => e.sentiment === 'neutral').length,
  };

  const last7Days = entries.slice(0, 7).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MoodJournal</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'Friend'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {quote && (
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg font-medium mb-2 leading-relaxed">"{quote.quote}"</p>
                <p className="text-sm text-blue-100">— {quote.author}</p>
              </div>
            </div>
          </div>
        )}

        <JournalEntryComponent onEntrySaved={loadData} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Calendar}
            label="Total Entries"
            value={stats.total}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard
            icon={Smile}
            label="Positive Days"
            value={stats.positive}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={Meh}
            label="Neutral Days"
            value={stats.neutral}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Frown}
            label="Challenging Days"
            value={stats.negative}
            color="bg-orange-100 text-orange-600"
          />
        </div>

        {last7Days.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Emotional Journey</h2>
                <p className="text-sm text-gray-600">Last 7 days overview</p>
              </div>
            </div>
            <EmotionalChart entries={last7Days} />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Entries</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No entries yet</p>
              <p className="text-sm">Start your emotional wellness journey by writing your first entry above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
