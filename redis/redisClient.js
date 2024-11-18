const redis = require('redis');

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

client.on('connect', () => console.log('Connected to Redis'));
client.on('error', (err) => console.error('Redis connection error:', err));

(async () => {
    await client.connect();
})();

module.exports = client;
