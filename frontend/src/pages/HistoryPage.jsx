import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Trash2, Loader2, Terminal } from 'lucide-react';
import PageLayout from '../components/Layout/PageLayout';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (q = '', p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/history', { params: { search: q, page: p, limit: 20 } });
      setHistory(data.history);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(search, page); }, [search, page]);

  const handleClear = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    await api.delete('/history');
    setHistory([]);
    setTotal(0);
    toast.success('History cleared');
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-accent-blue" />
          <div>
            <h1 className="text-xl font-semibold text-canvas-text">Command History</h1>
            <p className="text-xs text-canvas-muted">{total} total commands run</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={handleClear} className="btn-danger flex items-center gap-1.5 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search commands..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-canvas-muted">
          <Terminal className="w-12 h-12 opacity-20" />
          <p className="text-sm">No history found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card hover:border-canvas-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-accent-green font-mono text-sm font-semibold">$ {entry.command}</span>
                    {entry.repository && (
                      <span className="text-xs text-canvas-muted bg-canvas-bg px-1.5 py-0.5 rounded border border-canvas-border">
                        {entry.repository.name}
                      </span>
                    )}
                  </div>
                  {entry.result && (
                    <pre className="text-xs text-canvas-muted whitespace-pre-wrap break-words mt-1">
                      {entry.result}
                    </pre>
                  )}
                  {entry.explanation && (
                    <p className="text-xs text-canvas-muted/70 mt-1 italic border-t border-canvas-border pt-1">
                      📖 {entry.explanation}
                    </p>
                  )}
                </div>
                <span className="text-xs text-canvas-muted flex-shrink-0">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs text-canvas-muted">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </PageLayout>
  );
}
