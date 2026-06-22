import express from 'express';
import MealPlan from '../models/MealPlan.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Save a generated meal plan
// @route   POST /api/mealplans
// @access  Private
router.post('/', protect, async (req, res) => {
    const { weight, height, activity, goal, diet, plan } = req.body;

    if (!plan) {
        return res.status(400).json({ message: 'No meal plan data provided' });
    }

    try {
        const savedPlan = await MealPlan.create({
            userId: req.user._id.toString(),
            weight,
            height,
            activity,
            goal,
            diet,
            calories: plan.calories,
            protein: plan.protein,
            carbs: plan.carbs,
            fat: plan.fat,
            days: plan.days,
            groceryList: plan.groceryList
        });

        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error saving meal plan' });
    }
});

// @desc    Get all saved meal plans for the logged-in user
// @route   GET /api/mealplans
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const plans = await MealPlan.find({ userId: req.user._id.toString() });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching saved meal plans' });
    }
});

// @desc    Delete a saved meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const existing = await MealPlan.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        if (existing.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this meal plan' });
        }

        await MealPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Meal plan removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing meal plan' });
    }
});

export default router;