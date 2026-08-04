import mongoose from 'mongoose';

const commitSchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  author: { type: String, default: 'user' },
  timestamp: { type: Date, default: Date.now },
  parents: [{ type: String }],
  branch: { type: String },
  hash: { type: String },
  isMerge: { type: Boolean, default: false },
  tags: [{ type: String }],
  staged: [{ type: String }],
});

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  commitId: { type: String, required: true },
  color: { type: String, default: '#58a6ff' },
});

const stashEntrySchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, default: 'stash entry' },
  files: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

const repoStateSchema = new mongoose.Schema({
  commits: [commitSchema],
  branches: [branchSchema],
  HEAD: { type: String, default: 'main' },
  detachedHEAD: { type: Boolean, default: false },
  detachedCommitId: { type: String, default: null },
  stagingArea: [{ type: String }],
  workingDirectory: [{ type: String }],
  stash: [stashEntrySchema],
  tags: { type: Map, of: String, default: {} },
  initialized: { type: Boolean, default: false },
});

const repositorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    state: { type: repoStateSchema, default: () => ({}) },
    commandHistory: [
      {
        command: String,
        timestamp: { type: Date, default: Date.now },
        result: String,
        explanation: String,
      },
    ],
    undoStack: [{ type: mongoose.Schema.Types.Mixed }],
    redoStack: [{ type: mongoose.Schema.Types.Mixed }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
