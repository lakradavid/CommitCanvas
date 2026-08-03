import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: { type: String, default: 'general' },
    instructions: [{ type: String }],
    initialState: { type: mongoose.Schema.Types.Mixed, default: {} },
    targetState: { type: mongoose.Schema.Types.Mixed, default: {} },
    hints: [{ type: String }],
    solution: [{ type: String }],
    points: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
