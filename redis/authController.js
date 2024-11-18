const express = require('express');
const SessionService = require('./sessionService');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    try {
        const sessionId = await SessionService.createSession(userId);
        res.cookie('sessionId', sessionId, { httpOnly: true });
        res.status(200).json({ message: 'Logged in successfully', sessionId });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.post('/logout', async (req, res) => {
    const sessionId = req.cookies.sessionId || req.body.sessionId;

    if (!sessionId) {
        return res.status(400).send('Session ID is required');
    }

    try {
        await SessionService.deleteSession(sessionId);
        res.clearCookie('sessionId');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
