import express from 'express';
import Routine from '../models/Routine.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new routine
// @route   POST /api/routines
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, difficulty, exercises } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const routine = await Routine.create({
      title,
      creatorId: req.user._id.toString(),
      difficulty: difficulty || 'Beginner',
      exercises: exercises || []
    });

    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ message: 'Error creating routine' });
  }
});

// @desc    Get all routines (or by creatorId)
// @route   GET /api/routines
// @access  Private
router.get('/', protect, async (req, res) => {
  const { creatorId } = req.query;
  const query = creatorId ? { creatorId } : {};

  try {
    const routines = await Routine.find(query);
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routines' });
  }
});

// @desc    Get routine by ID
// @route   GET /api/routines/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }
    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routine details' });
  }
});

// @desc    Update a routine
// @route   PUT /api/routines/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    if (routine.creatorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this routine' });
    }

    const { title, difficulty, exercises } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (exercises !== undefined) updates.exercises = exercises;

    const updatedRoutine = await Routine.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating routine' });
  }
});

// @desc    Delete a routine
// @route   DELETE /api/routines/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    if (routine.creatorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this routine' });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Routine removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing routine' });
  }
});

export default router;
