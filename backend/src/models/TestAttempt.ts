import mongoose, { Schema } from "mongoose";

export type TestType = "initial" | "skill" | "level";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type McqQuestion = {
  id: string;
  skill: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  correctIndex: number;
  explain?: string;
};

export type TestAttemptDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  type: TestType;
  difficulty: Difficulty;
  skills: string[];
  questions: McqQuestion[];
  answers?: number[];
  score?: number; // 0..100
  passed?: boolean;
  improvementTopics?: string[];
  createdAt: Date;
  updatedAt: Date;
};

const questionSchema = new Schema<McqQuestion>(
  {
    id: { type: String, required: true },
    skill: { type: String, required: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explain: { type: String, required: false }
  },
  { _id: false }
);

const testAttemptSchema = new Schema<TestAttemptDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["initial", "skill", "level"], required: true, index: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true, index: true },
    skills: { type: [String], default: [] },
    questions: { type: [questionSchema], default: [] },
    answers: { type: [Number], required: false },
    score: { type: Number, required: false },
    passed: { type: Boolean, required: false },
    improvementTopics: { type: [String], required: false }
  },
  { timestamps: true }
);

export const TestAttemptModel = mongoose.model<TestAttemptDoc>("TestAttempt", testAttemptSchema);

