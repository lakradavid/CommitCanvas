import { motion } from 'framer-motion';
import { GitBranch, Layers, FolderOpen, Tag, Package } from 'lucide-react';

export default function RepoStatePanel({ state }) {
  if (!state) return null;

  const { branches, HEAD, stagingArea, workingDirectory, stash, tags, detachedHEAD, initialized, commits } = state;
  const tagsObj = tags instanceof Map ? Object.fromEntries(tags) : tags || {};

  const sections = [
    {
      icon: GitBranch,
      label: 'Branches',
      color: 'text-accent-blue',
      content: branches.length === 0 ? (
        <p className="text-canvas-muted text-xs italic">No branches</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {branches.map((b) => (
            <span
              key={b.name}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border"
              style={{
                backgroundColor: `${b.color}18`,
                borderColor: `${b.color}60`,
                color: b.color,
              }}
            >
              {b.name === HEAD && !detachedHEAD && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              {b.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      icon: Layers,
      label: 'Staging Area',
      color: 'text-accent-green',
      content: stagingArea.length === 0 ? (
        <p className="text-canvas-muted text-xs italic">Nothing staged</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {stagingArea.map((f) => (
            <span key={f} className="px-1.5 py-0.5 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded text-xs">
              {f}
            </span>
          ))}
        </div>
      ),
    },
    {
      icon: FolderOpen,
      label: 'Working Directory',
      color: 'text-accent-orange',
      content: workingDirectory.length === 0 ? (
        <p className="text-canvas-muted text-xs italic">Clean</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {workingDirectory.map((f) => (
            <span key={f} className="px-1.5 py-0.5 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded text-xs">
              {f}
            </span>
          ))}
        </div>
      ),
    },
    {
      icon: Package,
      label: `Stash (${stash.length})`,
      color: 'text-accent-purple',
      content: stash.length === 0 ? (
        <p className="text-canvas-muted text-xs italic">Empty stash</p>
      ) : (
        <div className="flex flex-col gap-1">
          {stash.map((s, i) => (
            <span key={s.id} className="px-1.5 py-0.5 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded text-xs truncate">
              stash@{'{'}'{i}{'}'}: {s.message}
            </span>
          ))}
        </div>
      ),
    },
  ];

  if (Object.keys(tagsObj).length > 0) {
    sections.push({
      icon: Tag,
      label: 'Tags',
      color: 'text-accent-yellow',
      content: (
        <div className="flex flex-wrap gap-1">
          {Object.keys(tagsObj).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow rounded text-xs">
              🏷 {t}
            </span>
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* HEAD info */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-canvas-bg rounded-md border border-canvas-border text-xs">
        <span className="text-accent-yellow font-bold">HEAD</span>
        <span className="text-canvas-muted">→</span>
        <span className="text-canvas-text font-semibold">
          {detachedHEAD ? `(detached at ${state.detachedCommitId?.slice(0, 7)})` : HEAD}
        </span>
        <span className="ml-auto text-canvas-muted">{commits.length} commit{commits.length !== 1 ? 's' : ''}</span>
      </div>

      {sections.map(({ icon: Icon, label, color, content }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-1.5"
        >
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
          {content}
        </motion.div>
      ))}
    </div>
  );
}
