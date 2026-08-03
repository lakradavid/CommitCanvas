import { useRef, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CommitNode from './CommitNode';
import BranchLabel from './BranchLabel';
import { buildGraphElements } from './graphUtils';
import { Download, GitBranch } from 'lucide-react';
import html2canvas from 'html2canvas';

const nodeTypes = { commitNode: CommitNode, branchLabel: BranchLabel };

// Default edge style
const defaultEdgeOptions = {
  style: { strokeWidth: 2 },
};

function GitGraphInner({ state }) {
  const flowRef = useRef(null);
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const result = buildGraphElements(state);
    // Re-fit after layout updates
    setTimeout(() => fitView({ padding: 0.35, duration: 400 }), 50);
    return result;
  }, [state]);

  const handleExport = useCallback(async () => {
    if (!flowRef.current) return;
    try {
      const canvas = await html2canvas(flowRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'commit-graph.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  }, []);

  // Not initialized yet
  if (!state?.initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: '#8b949e' }}>
        <GitBranch style={{ width: 48, height: 48, opacity: 0.2 }} />
        <p className="text-sm">
          Run <code style={{ color: '#58a6ff' }}>git init</code> to start the graph
        </p>
      </div>
    );
  }

  // Initialized but no commits yet
  if (nodes.filter((n) => n.type === 'commitNode').length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: '#8b949e' }}>
        <GitBranch style={{ width: 48, height: 48, opacity: 0.2 }} />
        <p className="text-sm">
          No commits yet — try{' '}
          <code style={{ color: '#3fb950' }}>touch file.txt</code>{' '}
          then{' '}
          <code style={{ color: '#3fb950' }}>git add .</code>{' '}
          then{' '}
          <code style={{ color: '#3fb950' }}>git commit -m "msg"</code>
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" ref={flowRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.2}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#30363d"
        />
        <Controls
          showInteractive={false}
          style={{ bottom: 16, left: 16 }}
        />
        <MiniMap
          nodeColor={(n) => n.data?.branchColor || '#58a6ff'}
          maskColor="#0d111788"
          style={{ bottom: 16, right: 16, background: '#161b22', border: '1px solid #30363d' }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Export PNG */}
      <button
        onClick={handleExport}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
          text-xs transition-colors"
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          color: '#8b949e',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#e6edf3';
          e.currentTarget.style.borderColor = '#58a6ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#8b949e';
          e.currentTarget.style.borderColor = '#30363d';
        }}
        title="Export commit graph as PNG"
      >
        <Download style={{ width: 13, height: 13 }} />
        Export PNG
      </button>
    </div>
  );
}

export default function GitGraph({ state }) {
  return (
    <ReactFlowProvider>
      <GitGraphInner state={state} />
    </ReactFlowProvider>
  );
}
