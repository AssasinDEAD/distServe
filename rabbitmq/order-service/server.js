const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'order-topic-exchange';

async function sendOrder(order, routingKey) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(order)));
    console.log(`Order sent to ${routingKey}:`, order);
    await channel.close();
    await connection.close();
}

app.post('/orders', async (req, res) => {
    const { restaurant, courier, foods, region } = req.body;
    const order = { restaurant, courier, foods, status: 'New' };
    const routingKey = `order.${region.toLowerCase()}`;
    await sendOrder(order, routingKey);
    res.send({ message: 'Order sent', order });
});

app.listen(3000, () => console.log('Order Service is running on port 3000'));
