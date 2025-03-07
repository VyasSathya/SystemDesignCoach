const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, experience } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (experience) user.experience = experience;
    
    user.profileCompleted = true;
    await user.save();
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        experience: user.experience,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;