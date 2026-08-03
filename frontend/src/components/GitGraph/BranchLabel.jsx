import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

function BranchLabel({ data }) {
  const { branch, isCurrentBranch } = data;
  const color = branch.color || '#58a6ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border select-none"
        style={{
          backgroundColor: `${color}20`,
          borderColor: isCurrentBranch ? color : `${color}55`,
          color,
          opacity: isCurrentBranch ? 1 : 0.75,
          whiteSpace: 'nowrap',
          boxShadow: isCurrentBranch ? `0 0 8px ${color}44` : 'none',
        }}
      >
        <GitBranch style={{ width: 11, height: 11 }} />
        <span>{branch.name}</span>
        {isCurrentBranch && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </div>

      {/* connector goes downward to the commit */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', bottom: -2 }}
      />
    </motion.div>
  );
}

export default memo(BranchLabel);
