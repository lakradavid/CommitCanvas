import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Loader2, ChevronRight, Star, CheckCircle2, X, Lightbulb } from 'lucide-react';
import PageLayout from '../components/Layout/PageLayout';
import api from '../lib/api';
import { useRepoStore } from '../store/repoStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = {
  beginner: 'text-accent-green bg-accent-green/10 border-accent-green/30',
  intermediate: 'text-accent-orange bg-accent-orange/10 border-accent-orange/30',
  advanced: 'text-accent-red bg-accent-red/10 border-accent-red/30',
};

export default function ChallengePage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [practiceRepoId, setPracticeRepoId] = useState(null);
  const { createRepo } = useRepoStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/challenges')
      .then(({ data }) => setChallenges(data.challenges))
      .catch(() => toast.error('Failed to load challenges'))
      .finally(() => setLoading(false));
  }, []);

  const handleStartChallenge = async (challenge) => {
    setSelected(challenge);
    setShowHints(false);
  };

  const handlePractice = async () => {
    try {
      const repo = await createRepo(`challenge-${selected.title.slice(0, 20)}`, `Practice: ${selected.title}`);
      toast.success('Practice repo created!');
      navigate(`/simulator/${repo._id}`);
    } catch {
      toast.error('Failed to create practice repo');
    }
  };

  return (
    <PageLayout>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-accent-yellow" />
        <div>
          <h1 className="text-xl font-semibold text-canvas-text">Git Challenges</h1>
          <p className="text-xs text-canvas-muted">Practice Git concepts with guided exercises</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge, i) => (
            <motion.div
              key={challenge._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:border-accent-blue/50 transition-all cursor-pointer group"
              onClick={() => handleStartChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-canvas-muted">#{challenge.order || i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-canvas-text text-sm group-hover:text-accent-blue transition-colors">
                      {challenge.title}
                    </h3>
                    <span className={`badge border text-xs mt-0.5 ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-accent-yellow text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-accent-yellow" />
                  {challenge.points}
                </div>
              </div>

              <p className="text-xs text-canvas-muted mb-3 line-clamp-2">{challenge.description}</p>

              <div className="flex items-center justify-between text-xs text-canvas-muted">
                <span className="px-1.5 py-0.5 bg-canvas-bg border border-canvas-border rounded">
                  {challenge.category}
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Challenge detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg card max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-canvas-text text-lg">{selected.title}</h2>
                  <span className={`badge border text-xs ${DIFFICULTY_COLORS[selected.difficulty]}`}>
                    {selected.difficulty}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="text-canvas-muted hover:text-canvas-text p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-canvas-muted mb-4">{selected.description}</p>

              {/* Instructions */}
              <div className="mb-4">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-canvas-text mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-accent-blue" /> Instructions
                </h3>
                <ol className="flex flex-col gap-1.5">
                  {selected.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-canvas-muted">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-blue/10 text-accent-blue
                        flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <code className="font-mono">{step}</code>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Hints toggle */}
              <button
                onClick={() => setShowHints((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-accent-yellow mb-3 hover:opacity-80"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHints ? 'Hide hints' : 'Show hints'}
              </button>

              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-md p-3">
                      {selected.hints.map((hint, i) => (
                        <p key={i} className="text-xs text-canvas-muted mb-1 last:mb-0">💡 {hint}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handlePractice} className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Start Practice Repo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
