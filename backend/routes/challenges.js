import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Admin Only)
router.post('/', protect, async (req, res) => {
  const { name, description, targetXp, targetGoal, unit, startDate, endDate } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can create global challenges' });
  }

  if (!name || !description || !targetGoal || !startDate || !endDate) {
    return res.status(400).json({ message: 'Please provide all required challenge fields' });
  }

  try {
    const challenge = await Challenge.create({
      name,
      description,
      targetXp: targetXp || 100,
      targetGoal,
      unit: unit || 'workouts',
      startDate,
      endDate
    });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active challenges' });
  }
});

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const alreadyJoined = challenge.participants.some(p => p.userId === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this challenge' });
    }

    // Add participant to challenge
    const updatedParticipants = [...challenge.participants, { userId: req.user._id.toString(), progress: 0, completed: false }];
    await Challenge.findByIdAndUpdate(req.params.id, { participants: updatedParticipants });

    // Update user active challenges list
    const updatedActiveChallenges = [...(req.user.activeChallengeIds || []), req.params.id];
    await User.findByIdAndUpdate(req.user._id.toString(), { activeChallengeIds: updatedActiveChallenges });

    res.json({ message: 'Successfully joined challenge', challengeId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error joining challenge' });
  }
});

// @desc    Update progress in a challenge
// @route   POST /api/challenges/:id/progress
// @access  Private
router.post('/:id/progress', protect, async (req, res) => {
  const { increment } = req.body;
  const incValue = increment !== undefined ? Number(increment) : 1;

  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participants = challenge.participants || [];
    const index = participants.findIndex(p => p.userId === req.user._id.toString());

    if (index === -1) {
      return res.status(400).json({ message: 'You must join the challenge first before updating progress' });
    }

    const p = participants[index];
    if (p.completed) {
      return res.status(400).json({ message: 'Challenge already completed!' });
    }

    const newProgress = Math.min(p.progress + incValue, challenge.targetGoal);
    const completed = newProgress >= challenge.targetGoal;

    p.progress = newProgress;
    p.completed = completed;

    // Save challenge progress
    await Challenge.findByIdAndUpdate(req.params.id, { participants });

    // Reward user with XP and custom badges if completed!
    let rewardGiven = false;
    let badgeEarned = '';
    if (completed) {
      const user = await User.findById(req.user._id.toString());
      const newXp = (user.xp || 0) + challenge.targetXp;
      
      // Determine badge
      const newBadge = `🏆 ${challenge.name} Finisher`;
      const currentBadges = user.badges || [];
      const updatedBadges = currentBadges.includes(newBadge) ? currentBadges : [...currentBadges, newBadge];
      
      // Remove from active list
      const updatedActive = (user.activeChallengeIds || []).filter(cid => cid !== req.params.id);

      await User.findByIdAndUpdate(req.user._id.toString(), {
        xp: newXp,
        badges: updatedBadges,
        activeChallengeIds: updatedActive
      });

      rewardGiven = true;
      badgeEarned = newBadge;
    }

    res.json({
      message: completed ? 'Challenge complete! Reward awarded.' : 'Progress updated.',
      progress: newProgress,
      targetGoal: challenge.targetGoal,
      completed,
      rewardGiven,
      xpAwarded: completed ? challenge.targetXp : 0,
      badgeEarned: completed ? badgeEarned : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating challenge progress' });
  }
});

export default router;
