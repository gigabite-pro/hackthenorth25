const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET leaderboard - users sorted by points (descending)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find()
            .sort({ points: -1 })
            .limit(50)
            .select('email points coins createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET user by email
router.get('/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new user
router.post('/', async (req, res) => {
    try {
        const user = new User({
            email: req.body.email,
            points: req.body.points || 0,
            coins: req.body.coins || 1000
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update user by email
router.put('/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.points !== undefined) user.points = req.body.points;
        if (req.body.coins !== undefined) user.coins = req.body.coins;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST deduct coins when starting quiz
router.post('/:email/deduct-coins', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { amount } = req.body;
        if (user.coins < amount) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }

        user.coins -= amount;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST add coins when completing quiz
router.post('/:email/add-coins', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { amount } = req.body;
        user.coins += amount;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
