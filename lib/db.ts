import mongoose from "mongoose"

const MONGODB_URI = "mongodb+srv://root:root@cluster0.kveetcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Cache the mongoose connection to reuse it across requests
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
//urgent-important
//not-urgent-important
//urgent-not-important
//not-urgent-not-important

// Define schemas and models
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, required: true, enum: ["not-urgent-important", "urgent-not-important", "not-urgent-not-important", "urgent-important"] },
  category: { type: String, required: true, enum: ["work", "study", "startup", "personal"] },
  completed: { type: Boolean, default: false },
  dueDate: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  frequency: { type: String, required: true, enum: ["daily", "weekly", "weekdays", "weekends"] },
  streak: { type: Number, default: 0 },
  completedToday: { type: Boolean, default: false },
  history: [
    {
      date: String,
      completed: Boolean,
    },
  ],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

const TimeBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ["work", "study", "startup", "personal"] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, required: true, enum: ["work", "study", "startup", "personal"] },
  targetDate: { type: String, required: true },
  progress: { type: Number, default: 0 },
  metrics: [
    {
      name: { type: String, required: true },
      target: { type: Number, required: true },
      current: { type: Number, required: true },
    }
  ],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})


const JournalEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, default: "neutral", enum: ["great", "good", "neutral", "bad", "terrible"] },
  lessons: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

const DailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  sleep: { type: Number, required: true },
  energy: { type: Number, required: true },
  mood: { type: String, default: "neutral", enum: ["great", "good", "neutral", "bad", "terrible"] },
  distractions: [{ type: String }],
  timeSpent: [
    {
      category: String,
      hours: Number,
    },
  ],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

// Create models (only if they don't already exist)
export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema)
export const Habit = mongoose.models.Habit || mongoose.model("Habit", HabitSchema)
export const TimeBlock = mongoose.models.TimeBlock || mongoose.model("TimeBlock", TimeBlockSchema)
export const Goal = mongoose.models.Goal || mongoose.model("Goal", GoalSchema)
export const JournalEntry = mongoose.models.JournalEntry || mongoose.model("JournalEntry", JournalEntrySchema)
export const DailyLog = mongoose.models.DailyLog || mongoose.model("DailyLog", DailyLogSchema)
