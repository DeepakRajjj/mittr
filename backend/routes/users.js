const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users except current user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Getting users for:', req.user.id);
        const users = await User.find({ 
            _id: { $ne: req.user.id } 
        })
        .select('username email')
        .lean();

        // Filter out any invalid users
        const validUsers = users.filter(user => user._id && user.username);
        
        console.log('Found users:', validUsers.length);
        res.json(validUsers);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('username email friends')
            .lean();

        if (!user || !user._id || !user.username) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
