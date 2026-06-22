import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  progress: { type: Number, default: 0 }, // e.g. workouts completed, steps taken
  completed: { type: Boolean, default: false }
});

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  targetXp: { type: Number, default: 100 },
  targetGoal: { type: Number, default: 10 }, // e.g. 10 workouts
  unit: { type: String, default: 'workouts' }, // unit of tracking
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  participants: [participantSchema],
  createdAt: { type: Date, default: Date.now }
});

const ChallengeModel = mongoose.model('Challenge', challengeSchema);

export const Challenge = {
  find: async (query = {}) => {
    if (global.useLocalDB) return localDb.find('challenges', query);
    return await ChallengeModel.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useLocalDB) return localDb.findOne('challenges', query);
    return await ChallengeModel.findOne(query);
  },
  findById: async (id) => {
    if (global.useLocalDB) return localDb.findById('challenges', id);
    return await ChallengeModel.findById(id);
  },
  create: async (doc) => {
    if (global.useLocalDB) {
      return localDb.create('challenges', {
        participants: [],
        ...doc
      });
    }
    return await ChallengeModel.create(doc);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (global.useLocalDB) return localDb.findByIdAndUpdate('challenges', id, update);
    return await ChallengeModel.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (global.useLocalDB) return localDb.findByIdAndDelete('challenges', id);
    return await ChallengeModel.findByIdAndDelete(id);
  }
};
export default Challenge;
