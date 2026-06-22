import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 0 }, // in kg
  duration: { type: Number, default: 0 }, // in min
  rest: { type: Number, default: 60 } // in seconds
});

const routineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creatorId: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  exercises: [exerciseSchema],
  createdAt: { type: Date, default: Date.now }
});

const RoutineModel = mongoose.model('Routine', routineSchema);

export const Routine = {
  find: async (query = {}) => {
    if (global.useLocalDB) return localDb.find('routines', query);
    return await RoutineModel.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useLocalDB) return localDb.findOne('routines', query);
    return await RoutineModel.findOne(query);
  },
  findById: async (id) => {
    if (global.useLocalDB) return localDb.findById('routines', id);
    return await RoutineModel.findById(id);
  },
  create: async (doc) => {
    if (global.useLocalDB) {
      return localDb.create('routines', doc);
    }
    return await RoutineModel.create(doc);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (global.useLocalDB) return localDb.findByIdAndUpdate('routines', id, update);
    return await RoutineModel.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (global.useLocalDB) return localDb.findByIdAndDelete('routines', id);
    return await RoutineModel.findByIdAndDelete(id);
  }
};
export default Routine;
