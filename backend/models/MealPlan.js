import mongoose from 'mongoose';
import { localDb } from '../config/db.js';

const mealPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    weight: { type: Number },
    height: { type: Number },
    activity: { type: String },
    goal: { type: String },
    diet: { type: String },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    days: {
        breakfast: String,
        lunch: String,
        snack: String,
        dinner: String
    },
    groceryList: [String],
    createdAt: { type: Date, default: Date.now }
});

const MealPlanModel = mongoose.model('MealPlan', mealPlanSchema);

export const MealPlan = {
    find: async (query = {}) => {
        if (global.useLocalDB) return localDb.find('mealplans', query);
        return await MealPlanModel.find(query).sort({ createdAt: -1 });
    },
    findOne: async (query = {}) => {
        if (global.useLocalDB) return localDb.findOne('mealplans', query);
        return await MealPlanModel.findOne(query);
    },
    findById: async (id) => {
        if (global.useLocalDB) return localDb.findById('mealplans', id);
        return await MealPlanModel.findById(id);
    },
    create: async (doc) => {
        if (global.useLocalDB) {
            return localDb.create('mealplans', doc);
        }
        return await MealPlanModel.create(doc);
    },
    findByIdAndDelete: async (id) => {
        if (global.useLocalDB) return localDb.findByIdAndDelete('mealplans', id);
        return await MealPlanModel.findByIdAndDelete(id);
    }
};
export default MealPlan;