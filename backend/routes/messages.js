import express from 'express';
import Message from '../models/Message.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: 'Receiver identity and message body are required' });
  }

  try {
    const message = await Message.create({
      senderId: req.user._id.toString(),
      receiverId,
      content
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// @desc    Get message history with a specific user
// @route   GET /api/messages/:otherUserId
// @access  Private
router.get('/:otherUserId', protect, async (req, res) => {
  const otherUserId = req.params.otherUserId;
  const currentUserId = req.user._id.toString();

  try {
    // Find all messages sent between the current user and the other user
    const messages = await Message.find({});
    
    // Filter locally (works for both mongo and fallback json store cleanly)
    const thread = messages.filter(m => 
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId)
    );

    // Sort by timestamp
    thread.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Error loading conversation' });
  }
});

export default router;
