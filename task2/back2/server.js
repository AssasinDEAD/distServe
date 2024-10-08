const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');

// Подключение к базе данных DistTasks
const taskPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DistTasks',
    password: 'Serik2004',
    port: 5432,
});

// Подключение к базе данных DistUsers
const userPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DistUsers',
    password: 'Serik2004',
    port: 5432,
});

const app = express();

// Определение схемы GraphQL
const typeDefs = gql`
   type User {
        id: ID!
        name: String!
    }

   type Task {
        id: ID!
        description: String!
        user_id: Int!
        created_at: String
    }

    type Mutation {
        addTask(description: String!, userId: Int!): Task
    }

    type Query {
        tasks: [Task]
    }
`;

// Определение резолверов
const resolvers = {
    Query: {
        tasks: async () => {
            // Выполняем запрос к базе данных, чтобы получить задачи и имена пользователей
            const taskResult = await taskPool.query(`
                SELECT t.id, t.description, t.user_id, u.name
                FROM tasks t
                LEFT JOIN users u ON t.user_id = u.id
            `);

            // Возвращаем задачи с user_id и именем пользователя
            return taskResult.rows.map(task => ({
                id: task.id,
                description: task.description,
                user_id: task.user_id, // Возвращаем user_id
                created_at: task.created_at
            }));
        },
    },
    Mutation: {
        addTask: async (_, { description, userId }) => {
            // Добавляем новую задачу
            const result = await taskPool.query(
                'INSERT INTO tasks (description, user_id) VALUES ($1, $2) RETURNING *',
                [description, userId]
            );
            const task = result.rows[0];

            // Возвращаем добавленную задачу с user_id
            return {
                id: task.id,
                description: task.description,
                user_id: task.user_id,
                created_at: task.created_at
            };
        },
    },
};

// Создание и старт сервера Apollo
async function startServer() {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    // Применение middleware Express
    server.applyMiddleware({ app });

    // Запуск Express сервера на порту 3500
    app.listen(3500, () => {
        console.log(`Task service running on http://localhost:3500${server.graphqlPath}`);
    });
}

// Вызов функции для старта сервера
startServer().catch((error) => {
    console.error('Error starting server:', error);
});
