import mongoose from 'mongoose';

const simulationHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    command: { type: String, required: true },
    result: { type: String },
    explanation: { type: String },
    stateBefore: { type: mongoose.Schema.Types.Mixed },
    stateAfter: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

simulationHistorySchema.index({ user: 1, createdAt: -1 });
simulationHistorySchema.index({ repository: 1, createdAt: -1 });

const SimulationHistory = mongoose.model('SimulationHistory', simulationHistorySchema);
export default SimulationHistory;
