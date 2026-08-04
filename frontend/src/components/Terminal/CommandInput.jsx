import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronRight, RotateCcw, RotateCw, Loader2 } from 'lucide-react';
import { useRepoStore } from '../../store/repoStore';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'git init', 'git status', 'git log',
  'git add .', 'git add <file>',
  'git commit -m "message"',
  'git branch', 'git branch <name>',
  'git checkout <branch>', 'git checkout -b <branch>',
  'git merge <branch>', 'git rebase <branch>',
  'git stash', 'git stash pop', 'git stash list',
  'git reset --soft HEAD~1', 'git reset --hard HEAD~1',
  'git revert', 'git tag <name>',
  'touch <filename>',
];

export default function CommandInput({ repoName }) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const { runCommand, undo, redo, isRunning, commandOutput, explanation, commandHistory } = useRepoStore();
  const localHistory = commandHistory.map((h) => h.command);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    setInput('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
    const result = await runCommand(cmd);
    if (result?.success === false) {
      toast.error(result.error || 'Command failed');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, localHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(localHistory[localHistory.length - 1 - newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : localHistory[localHistory.length - 1 - newIndex] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 1) {
      const filtered = SUGGESTIONS.filter((s) => s.toLowerCase().startsWith(val.toLowerCase()));
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Output area */}
      <AnimatePresence>
        {commandOutput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-canvas-bg border border-canvas-border rounded-md p-3 text-xs font-mono"
          >
            <pre className="text-accent-green whitespace-pre-wrap break-words">{commandOutput}</pre>
            {explanation && (
              <div className="mt-2 pt-2 border-t border-canvas-border">
                <p className="text-canvas-muted text-xs">
                  <span className="text-accent-blue font-semibold">📖 </span>
                  {explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-canvas-bg border border-canvas-border rounded-md
          focus-within:border-accent-blue transition-colors overflow-hidden">
          {/* Prompt */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-r border-canvas-border text-canvas-muted text-xs flex-shrink-0">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-accent-green font-semibold">{repoName}</span>
            <ChevronRight className="w-3 h-3" />
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="git init, git commit -m &quot;message&quot;, touch file.txt..."
            disabled={isRunning}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-canvas-text placeholder-canvas-muted
              focus:outline-none disabled:opacity-50"
            aria-label="Git command input"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Loading */}
          {isRunning && <Loader2 className="w-4 h-4 text-accent-blue animate-spin mr-3" />}
        </div>

        {/* Autocomplete suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 bg-canvas-surface border border-canvas-border
                rounded-md shadow-xl z-50 overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setInput(s); setShowSuggestions(false); inputRef.current?.focus(); }}
                  className="w-full text-left px-3 py-2 text-xs font-mono text-canvas-muted hover:bg-canvas-bg
                    hover:text-canvas-text transition-colors"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={isRunning}
          className="flex items-center gap-1 px-2 py-1 text-xs text-canvas-muted hover:text-canvas-text
            bg-canvas-surface border border-canvas-border rounded-md hover:border-accent-blue transition-colors disabled:opacity-40"
          title="Undo last command (Ctrl+Z)"
        >
          <RotateCcw className="w-3 h-3" /> Undo
        </button>
        <button
          onClick={redo}
          disabled={isRunning}
          className="flex items-center gap-1 px-2 py-1 text-xs text-canvas-muted hover:text-canvas-text
            bg-canvas-surface border border-canvas-border rounded-md hover:border-accent-blue transition-colors disabled:opacity-40"
          title="Redo command (Ctrl+Y)"
        >
          <RotateCw className="w-3 h-3" /> Redo
        </button>
        <span className="text-xs text-canvas-muted ml-auto">↑↓ history · Tab autocomplete</span>
      </div>
    </div>
  );
}
