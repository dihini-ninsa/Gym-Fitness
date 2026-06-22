import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model('Message', messageSchema);

export const Message = {
  find: async (query = {}) => {
    if (global.useLocalDB) return localDb.find('messages', query);
    return await MessageModel.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useLocalDB) return localDb.findOne('messages', query);
    return await MessageModel.findOne(query);
  },
  findById: async (id) => {
    if (global.useLocalDB) return localDb.findById('messages', id);
    return await MessageModel.findById(id);
  },
  create: async (doc) => {
    if (global.useLocalDB) {
      return localDb.create('messages', doc);
    }
    return await MessageModel.create(doc);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (global.useLocalDB) return localDb.findByIdAndUpdate('messages', id, update);
    return await MessageModel.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (global.useLocalDB) return localDb.findByIdAndDelete('messages', id);
    return await MessageModel.findByIdAndDelete(id);
  }
};
export default Message;
