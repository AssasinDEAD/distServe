const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'order-topic-exchange';

async function listenForOrders() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    const queue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue.queue, EXCHANGE_NAME, 'order.#');

    console.log('Listening for orders...');
    channel.consume(queue.queue, (msg) => {
        const order = JSON.parse(msg.content.toString());
        console.log(`Received order in region ${msg.fields.routingKey}:`, order);
    }, { noAck: true });
}

listenForOrders().catch(console.error);
