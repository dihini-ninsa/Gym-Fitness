import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyaegisfit123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, age, phone, nic, role, adminSecret, coachSecret, gymownerSecret } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email and password' });
  }

  // Security Lock: Validate secret code before assigning Admin role
  if (role === 'admin') {
    const expectedSecret = process.env.ADMIN_SECRET || 'aegis-admin-key';
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ message: 'Forbidden: Invalid Admin Verification Secret' });
    }
  }

  if (role === 'coach') {
    const expectedSecret = process.env.COACH_SECRET || 'aegis-coach-key';
    if (coachSecret !== expectedSecret) {
      return res.status(403).json({ message: 'Forbidden: Invalid Coach Verification Secret' });
    }
  }

  if (role === 'gymowner') {
    const expectedSecret = process.env.GYMOWNER_SECRET || 'aegis-gymowner-key';
    if (gymownerSecret !== expectedSecret) {
      return res.status(403).json({ message: 'Forbidden: Invalid Gymowner Verification Secret' });
    }
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      age,
      phone,
      nic,
      role: role || 'user'
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      age: user.age,
      phone: user.phone,
      nic: user.nic,
      role: user.role,
      xp: user.xp,
      badges: user.badges,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      xp: user.xp,
      badges: user.badges,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    xp: req.user.xp,
    badges: req.user.badges,
    activeChallengeIds: req.user.activeChallengeIds
  });
});

// @desc    Get all users (with optional role query)
// @route   GET /api/auth/users
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query);

    // Return users without passwords
    const sanitizedUsers = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      xp: u.xp,
      badges: u.badges
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// @desc    Update user details (e.g. increase XP, add badges, approve/reject user/gym/coach status)
// @route   PUT /api/auth/user/:id
// @access  Private
router.put('/user/:id', protect, async (req, res) => {
  const { xp, badges, activeChallengeIds, username } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify requesting user is updating themselves OR requesting user is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updates = {};
    if (xp !== undefined) updates.xp = xp;
    if (badges !== undefined) updates.badges = badges;
    if (activeChallengeIds !== undefined) updates.activeChallengeIds = activeChallengeIds;
    if (username !== undefined) updates.username = username;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      xp: updatedUser.xp,
      badges: updatedUser.badges,
      activeChallengeIds: updatedUser.activeChallengeIds
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

export default router;
