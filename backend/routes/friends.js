const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all friends
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'username email')
            .lean();

        if (!user || !user.friends) {
            return res.json([]);
        }

        const validFriends = user.friends.filter(friend => friend && friend._id);
        res.json(validFriends);
    } catch (err) {
        console.error('Error getting friends:', err);
        res.status(500).json({ message: err.message });
    }
});

// Send friend request
router.post('/request/:userId', auth, async (req, res) => {
    try {
        const toUser = await User.findById(req.params.userId);
        const fromUser = await User.findById(req.user.id);

        if (!toUser || !fromUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize arrays if they don't exist
        if (!toUser.receivedFriendRequests) toUser.receivedFriendRequests = [];
        if (!fromUser.sentFriendRequests) fromUser.sentFriendRequests = [];
        if (!toUser.friends) toUser.friends = [];
        if (!fromUser.friends) fromUser.friends = [];

        // Check if users are already friends
        const alreadyFriends = toUser.friends.some(friendId => 
            friendId && friendId.toString() === fromUser._id.toString()
        );
        
        if (alreadyFriends) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already exists
        const requestExists = toUser.receivedFriendRequests.some(request => 
            request && request.from && request.from.toString() === fromUser._id.toString()
        );

        if (requestExists) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        // Add request
        toUser.receivedFriendRequests.push({
            from: fromUser._id,
            timestamp: new Date()
        });

        fromUser.sentFriendRequests.push({
            to: toUser._id,
            timestamp: new Date()
        });

        await Promise.all([toUser.save(), fromUser.save()]);
        res.json({ message: 'Friend request sent' });
    } catch (err) {
        console.error('Error in friend request:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get received friend requests
router.get('/requests/received', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('receivedFriendRequests.from', 'username email')
            .lean();

        if (!user || !user.receivedFriendRequests) {
            return res.json([]);
        }

        const validRequests = user.receivedFriendRequests.filter(request => 
            request && request.from && request.from._id
        );

        res.json(validRequests);
    } catch (err) {
        console.error('Error getting received requests:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get sent friend requests
router.get('/requests/sent', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('sentFriendRequests.to', 'username email')
            .lean();

        if (!user || !user.sentFriendRequests) {
            return res.json([]);
        }

        const validRequests = user.sentFriendRequests.filter(request => 
            request && request.to && request.to._id
        );

        res.json(validRequests);
    } catch (err) {
        console.error('Error getting sent requests:', err);
        res.status(500).json({ message: err.message });
    }
});

// Accept friend request
router.post('/accept/:userId', auth, async (req, res) => {
    try {
        const [currentUser, requestUser] = await Promise.all([
            User.findById(req.user.id),
            User.findById(req.params.userId)
        ]);

        if (!currentUser || !requestUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize arrays if they don't exist
        if (!currentUser.friends) currentUser.friends = [];
        if (!requestUser.friends) requestUser.friends = [];
        if (!currentUser.receivedFriendRequests) currentUser.receivedFriendRequests = [];
        if (!requestUser.sentFriendRequests) requestUser.sentFriendRequests = [];

        // Add to friends lists
        currentUser.friends.push(requestUser._id);
        requestUser.friends.push(currentUser._id);

        // Remove friend requests
        currentUser.receivedFriendRequests = currentUser.receivedFriendRequests.filter(request =>
            !request.from || request.from.toString() !== requestUser._id.toString()
        );

        requestUser.sentFriendRequests = requestUser.sentFriendRequests.filter(request =>
            !request.to || request.to.toString() !== currentUser._id.toString()
        );

        await Promise.all([currentUser.save(), requestUser.save()]);
        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        console.error('Error accepting friend request:', err);
        res.status(500).json({ message: err.message });
    }
});

// Decline friend request
router.post('/decline/:userId', auth, async (req, res) => {
    try {
        const [currentUser, requestUser] = await Promise.all([
            User.findById(req.user.id),
            User.findById(req.params.userId)
        ]);

        if (!currentUser || !requestUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize arrays if they don't exist
        if (!currentUser.receivedFriendRequests) currentUser.receivedFriendRequests = [];
        if (!requestUser.sentFriendRequests) requestUser.sentFriendRequests = [];

        // Remove friend requests
        currentUser.receivedFriendRequests = currentUser.receivedFriendRequests.filter(request =>
            !request.from || request.from.toString() !== requestUser._id.toString()
        );

        requestUser.sentFriendRequests = requestUser.sentFriendRequests.filter(request =>
            !request.to || request.to.toString() !== currentUser._id.toString()
        );

        await Promise.all([currentUser.save(), requestUser.save()]);
        res.json({ message: 'Friend request declined' });
    } catch (err) {
        console.error('Error declining friend request:', err);
        res.status(500).json({ message: err.message });
    }
});

// Remove friend
router.post('/remove/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const [currentUser, friendToRemove] = await Promise.all([
            User.findById(currentUserId),
            User.findById(userId)
        ]);

        if (!currentUser || !friendToRemove) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from both users' friend lists
        currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
        friendToRemove.friends = friendToRemove.friends.filter(id => id.toString() !== currentUserId);

        await Promise.all([currentUser.save(), friendToRemove.save()]);

        res.json({ message: 'Friend removed successfully' });
    } catch (err) {
        console.error('Error removing friend:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
