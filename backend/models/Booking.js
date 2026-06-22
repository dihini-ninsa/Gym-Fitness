import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hostId: { type: String, required: true }, // Gym ID or Coach ID or name
  hostName: { type: String, required: true }, // Visual display name (e.g., CrossFit Colombo)
  dateTime: { type: String, required: true },
  type: { type: String, enum: ['class', 'slot', 'coaching'], default: 'slot' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'rejected'], default: 'pending' },
  qrCodeToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const BookingModel = mongoose.model('Booking', bookingSchema);

export const Booking = {
  find: async (query = {}) => {
    if (global.useLocalDB) return localDb.find('bookings', query);
    return await BookingModel.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useLocalDB) return localDb.findOne('bookings', query);
    return await BookingModel.findOne(query);
  },
  findById: async (id) => {
    if (global.useLocalDB) return localDb.findById('bookings', id);
    return await BookingModel.findById(id);
  },
  create: async (doc) => {
    if (global.useLocalDB) {
      return localDb.create('bookings', doc);
    }
    return await BookingModel.create(doc);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (global.useLocalDB) return localDb.findByIdAndUpdate('bookings', id, update);
    return await BookingModel.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (global.useLocalDB) return localDb.findByIdAndDelete('bookings', id);
    return await BookingModel.findByIdAndDelete(id);
  }
};
export default Booking;
