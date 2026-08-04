import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRepoStore } from '../store/repoStore';
import GitGraph from '../components/GitGraph/GitGraph';
import CommandInput from '../components/Terminal/CommandInput';
import CommandHistory from '../components/Terminal/CommandHistory';
import RepoStatePanel from '../components/StatePanel/RepoStatePanel';
import Navbar from '../components/Layout/Navbar';

const QUICK_COMMANDS = [
  { label: 'init', cmd: 'git init', color: 'text-accent-green' },
  { label: 'status', cmd: 'git status', color: 'text-accent-blue' },
  { label: 'log', cmd: 'git log', color: 'text-accent-blue' },
  { label: 'touch file.txt', cmd: 'touch file.txt', color: 'text-accent-orange' },
  { label: 'add .', cmd: 'git add .', color: 'text-accent-green' },
  { label: 'commit', cmd: 'git commit -m "message"', color: 'text-accent-purple' },
  { label: 'branch', cmd: 'git branch', color: 'text-accent-yellow' },
  { label: 'stash', cmd: 'git stash', color: 'text-accent-red' },
];

export default function SimulatorPage() {
  const { id } = useParams();
  const { loadRepo, currentRepo, isLoading, runCommand } = useRepoStore();
  const [rightPanel, setRightPanel] = useState('state'); // 'state' | 'history'

  useEffect(() => { loadRepo(id); }, [id]);

  if (isLoading || !currentRepo) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  const { state, name } = currentRepo;

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col">
      <Navbar />

      {/* Toolbar */}
      <div className="bg-canvas-surface border-b border-canvas-border px-4 py-2 flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-1 text-xs text-canvas-muted hover:text-canvas-text transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <span className="text-canvas-border">•</span>
        <span className="text-sm font-semibold text-canvas-text">{name}</span>

        {/* Quick commands */}
        <div className="hidden md:flex items-center gap-1 ml-4 flex-wrap">
          {QUICK_COMMANDS.map(({ label, cmd, color }) => (
            <button
              key={label}
              onClick={() => runCommand(cmd)}
              className={`px-2 py-0.5 text-xs rounded border border-canvas-border hover:border-canvas-muted
                bg-canvas-bg transition-colors ${color}`}
              title={cmd}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: graph | right panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph - main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Graph */}
          <div className="flex-1 relative" style={{ minHeight: '300px' }}>
            <GitGraph state={state} />
          </div>

          {/* Command area */}
          <div className="border-t border-canvas-border bg-canvas-surface p-4">
            <CommandInput repoName={name} />
          </div>
        </div>

        {/* Right side panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 border-l border-canvas-border bg-canvas-surface flex flex-col overflow-hidden"
        >
          {/* Panel tabs */}
          <div className="flex border-b border-canvas-border">
            {['state', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setRightPanel(tab)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors
                  ${rightPanel === tab
                    ? 'text-accent-blue border-b-2 border-accent-blue'
                    : 'text-canvas-muted hover:text-canvas-text'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanel === 'state' ? (
              <RepoStatePanel state={state} />
            ) : (
              <CommandHistory />
            )}
          </div>

          {/* Help */}
          <div className="border-t border-canvas-border p-3">
            <div className="flex items-center gap-1.5 text-xs text-canvas-muted mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-semibold">Supported commands</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['init','add','commit','branch','checkout','merge','rebase','reset','revert','stash','tag','status','log','touch'].map((c) => (
                <span key={c} className="px-1 py-0.5 bg-canvas-bg border border-canvas-border rounded text-xs text-canvas-muted">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
