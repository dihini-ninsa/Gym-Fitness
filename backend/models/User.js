import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  phone: { type: String },
  nic: { type: String },
  role: { type: String, enum: ['user', 'gym', 'coach', 'admin'], default: 'user' },
  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  activeChallengeIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', userSchema);

export const User = {
  find: async (query = {}) => {
    if (global.useLocalDB) return localDb.find('users', query);
    return await UserModel.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useLocalDB) return localDb.findOne('users', query);
    return await UserModel.findOne(query);
  },
  findById: async (id) => {
    if (global.useLocalDB) return localDb.findById('users', id);
    return await UserModel.findById(id);
  },
  create: async (doc) => {
    if (global.useLocalDB) {
      if (doc.email) {
        const exists = localDb.findOne('users', { email: doc.email });
        if (exists) throw new Error('Email already exists');
      }
      return localDb.create('users', {
        xp: 0,
        badges: [],
        activeChallengeIds: [],
        ...doc
      });
    }
    return await UserModel.create(doc);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (global.useLocalDB) return localDb.findByIdAndUpdate('users', id, update);
    return await UserModel.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (global.useLocalDB) return localDb.findByIdAndDelete('users', id);
    return await UserModel.findByIdAndDelete(id);
  }
};
export default User;
