import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useRepoStore } from '../../store/repoStore';

export default function CommandHistory() {
  const { commandHistory } = useRepoStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(true);

  const filtered = commandHistory
    .filter((h) => h.command.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .reverse()
    .slice(0, 30);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-semibold text-canvas-muted
          hover:text-canvas-text transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          History ({commandHistory.length})
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-canvas-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-canvas-bg border border-canvas-border rounded pl-7 pr-2 py-1.5 text-xs
                  text-canvas-text placeholder-canvas-muted focus:outline-none focus:border-accent-blue"
              />
            </div>

            {/* History list */}
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-canvas-muted text-center py-2">No history yet</p>
              ) : (
                filtered.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-canvas-bg group">
                    <span className="text-accent-green text-xs font-mono flex-1 truncate">$ {entry.command}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
