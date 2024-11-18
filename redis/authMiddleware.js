const SessionService = require('./sessionService');

async function authMiddleware(req, res, next) {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];

    if (!sessionId) {
        return res.status(401).json({ message: 'Unauthorized: Session ID is missing' });
    }

    try {
        const userId = await SessionService.getSession(sessionId);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Session expired or invalid' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        res.status(500).send('Server error');
    }
}

module.exports = authMiddleware;
