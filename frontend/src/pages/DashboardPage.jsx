import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GitBranch, Trash2, FolderGit2, Loader2, X, Calendar } from 'lucide-react';
import PageLayout from '../components/Layout/PageLayout';
import { useRepoStore } from '../store/repoStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { repos, fetchRepos, createRepo, deleteRepo, isLoading } = useRepoStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchRepos(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const repo = await createRepo(form.name.trim(), form.description.trim());
      toast.success('Repository created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      navigate(`/simulator/${repo._id}`);
    } catch {
      toast.error('Failed to create repository');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this repository?')) return;
    await deleteRepo(id);
    toast.success('Repository deleted');
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-canvas-text">
            Welcome back, <span className="text-accent-blue">{user?.username}</span>
          </h1>
          <p className="text-xs text-canvas-muted mt-1">Your Git simulation repositories</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Repository
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Repositories', value: repos.length, color: 'text-accent-blue' },
          { label: 'Commands Run', value: user?.stats?.commandsRun ?? 0, color: 'text-accent-green' },
          { label: 'Challenges Done', value: user?.stats?.challengesCompleted ?? 0, color: 'text-accent-purple' },
          { label: 'Repos Created', value: user?.stats?.reposCreated ?? 0, color: 'text-accent-orange' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-canvas-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Repos grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      ) : repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-canvas-muted">
          <FolderGit2 className="w-16 h-16 opacity-20" />
          <p className="text-sm">No repositories yet. Create one to start!</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {repos.map((repo, i) => (
              <motion.div
                key={repo._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/simulator/${repo._id}`)}
                className="card cursor-pointer hover:border-accent-blue/60 transition-all duration-200 group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-accent-blue/10 rounded-md">
                      <GitBranch className="w-4 h-4 text-accent-blue" />
                    </div>
                    <h3 className="font-semibold text-canvas-text text-sm group-hover:text-accent-blue transition-colors">
                      {repo.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, repo._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-canvas-muted hover:text-accent-red transition-all"
                    aria-label="Delete repository"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {repo.description && (
                  <p className="text-xs text-canvas-muted mb-3 truncate">{repo.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-canvas-muted">
                  <span>{repo.commandHistory?.length ?? 0} commands</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(repo.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Initialized badge */}
                <div className="absolute top-3 right-8">
                  {repo.state?.initialized ? (
                    <span className="badge bg-accent-green/10 text-accent-green border border-accent-green/20">init</span>
                  ) : (
                    <span className="badge bg-canvas-muted/10 text-canvas-muted border border-canvas-border">new</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-canvas-text">New Repository</h2>
                <button onClick={() => setShowCreate(false)} className="text-canvas-muted hover:text-canvas-text">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-canvas-muted mb-1 block">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input"
                    placeholder="my-project"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-canvas-muted mb-1 block">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input"
                    placeholder="Optional description"
                  />
                </div>
                <button type="submit" disabled={creating} className="btn-primary flex items-center justify-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? 'Creating...' : 'Create & Open'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
