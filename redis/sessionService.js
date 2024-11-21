const { v4: uuidv4 } = require('uuid');
const redisClient = require('./redisClient');

const SESSION_TTL = 1800;

class SessionService {
    static async createSession(userId) {
        const sessionId = uuidv4();
        await redisClient.set(`session:${sessionId}`, userId, { EX: SESSION_TTL });
        return sessionId;
    }

    static async getSession(sessionId) {
        return redisClient.get(`session:${sessionId}`);
    }

    static async deleteSession(sessionId) {
        await redisClient.del(`session:${sessionId}`);
    }
}

module.exports = SessionService;
