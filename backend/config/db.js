import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Ensure local data directory exists for JSON fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const localDb = {
  getPath: (collection) => path.join(DATA_DIR, `${collection}.json`),
  
  read: (collection) => {
    const filePath = localDb.getPath(collection);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading collection ${collection}:`, e);
      return [];
    }
  },
  
  write: (collection, data) => {
    const filePath = localDb.getPath(collection);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error(`Error writing collection ${collection}:`, e);
      return false;
    }
  },
  
  find: (collection, query = {}) => {
    const items = localDb.read(collection);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const items = localDb.read(collection);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  create: (collection, doc) => {
    const items = localDb.read(collection);
    const newDoc = {
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    localDb.write(collection, items);
    return newDoc;
  },

  findById: (collection, id) => {
    const items = localDb.read(collection);
    return items.find(item => item._id === id) || null;
  },

  findByIdAndUpdate: (collection, id, update) => {
    const items = localDb.read(collection);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...update, updatedAt: new Date().toISOString() };
    localDb.write(collection, items);
    return items[index];
  },

  findByIdAndDelete: (collection, id) => {
    let items = localDb.read(collection);
    const item = items.find(item => item._id === id);
    if (!item) return null;
    items = items.filter(item => item._id !== id);
    localDb.write(collection, items);
    return item;
  }
};

global.useLocalDB = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/aegisfit';
  console.log(`Connecting to MongoDB at: ${mongoURI}...`);
  
  try {
    // Attempt Mongoose connection with a quick 3-second timeout fallback
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB successfully connected.');
    global.useLocalDB = false;
  } catch (error) {
    console.warn('------------------------------------------------------------');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('AegisFit is transitioning to LOCAL JSON FILE DATABASE mode.');
    console.warn(`Local data will be stored in: ${DATA_DIR}`);
    console.warn('------------------------------------------------------------');
    global.useLocalDB = true;
  }
};

export default connectDB;
