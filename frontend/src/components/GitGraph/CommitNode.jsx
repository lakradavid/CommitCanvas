import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

function CommitNode({ data }) {
  const { commit, isHead, branchColor, isLatest } = data;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', left: -4, top: '40%' }}
      />

      {/* HEAD badge — absolutely positioned so it doesn't push circle down */}
      {isHead && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'absolute',
            top: -32,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '2px 7px',
            borderRadius: 4,
            border: '1px solid #e3b341',
            backgroundColor: '#0d1117',
            color: '#e3b341',
            fontSize: 11,
            fontWeight: 700,
            lineHeight: '16px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          HEAD
        </motion.div>
      )}

      {/* Commit circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="group"
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: commit.isMerge ? 6 : '50%',
          border: `2px solid ${branchColor}`,
          backgroundColor: `${branchColor}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: commit.isMerge ? 'rotate(45deg)' : undefined,
          boxShadow: isLatest ? `0 0 14px ${branchColor}55` : undefined,
          cursor: 'pointer',
        }}
      >
        {/* Inner dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: branchColor,
            transform: commit.isMerge ? 'rotate(-45deg)' : undefined,
          }}
        />

        {/* Hover tooltip */}
        <div
          style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: commit.isMerge ? 'rotate(-45deg) translateX(-50%)' : 'translateX(-50%)',
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 50,
            transition: 'opacity 0.15s',
          }}
          className="group-hover:opacity-100"
        >
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            minWidth: 160,
            boxShadow: '0 4px 24px #00000088',
          }}>
            <p style={{ color: '#e6edf3', fontWeight: 600, marginBottom: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {commit.message}
            </p>
            <p style={{ color: '#8b949e', fontFamily: 'monospace' }}>{commit.hash}</p>
            {commit.isMerge && <p style={{ color: '#d2a8ff', marginTop: 2 }}>⛙ merge commit</p>}
            {commit.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {commit.tags.map((tag) => (
                  <span key={tag} style={{ background: '#ffa65722', color: '#ffa657', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
                    🏷 {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hash label below the circle */}
      <div style={{
        marginTop: 6,
        fontSize: 11,
        color: '#8b949e',
        fontFamily: 'monospace',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        {commit.hash}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', right: -4, top: '40%' }}
      />
    </div>
  );
}

export default memo(CommitNode);
