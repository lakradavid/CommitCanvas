import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, GitCommit, GitMerge, Zap, Trophy, History } from 'lucide-react';

const features = [
  { icon: GitCommit, title: 'Visual Commit Graph', desc: 'See every commit, branch, and merge as an interactive animated graph.' },
  { icon: Zap, title: '11 Git Commands', desc: 'Simulate init, add, commit, branch, checkout, merge, rebase, reset, revert, stash, and tag.' },
  { icon: Trophy, title: 'Practice Challenges', desc: 'Solve progressive Git challenges from beginner to advanced.' },
  { icon: History, title: 'Command History', desc: 'Review and search everything you\'ve run, with explanations saved.' },
  { icon: GitMerge, title: 'Undo / Redo', desc: 'Experiment freely — undo and redo any command instantly.' },
  { icon: GitBranch, title: 'Export Graphs', desc: 'Export your commit graph as a PNG to share or study.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/30">
              <GitBranch className="w-10 h-10 text-accent-blue" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-canvas-text mb-4 tracking-tight">
            Learn Git <span className="text-accent-blue">Visually</span>
          </h1>
          <p className="text-lg text-canvas-muted mb-8 max-w-xl mx-auto">
            Commit Canvas is an interactive Git simulator. Run real Git commands, watch animated commit graphs, and master version control without touching a real repo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Start for free
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="card hover:border-accent-blue/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-accent-blue/10 rounded-md">
                  <Icon className="w-4 h-4 text-accent-blue" />
                </div>
                <h3 className="text-sm font-semibold text-canvas-text">{title}</h3>
              </div>
              <p className="text-xs text-canvas-muted">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
