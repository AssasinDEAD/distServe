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
        users: [User]
    }
`;

// Определение резолверов
const resolvers = {
    Query: {
        tasks: async () => {
            // Выполняем запрос к базе данных DistTasks для получения задач
            const taskResult = await taskPool.query(`
                SELECT id, description, user_id, created_at 
                FROM tasks
            `);

            const tasks = taskResult.rows;

            // Выполняем запрос к базе данных DistUsers для получения пользователей
            const userResult = await userPool.query(`
                SELECT id, name 
                FROM users
            `);

            const users = userResult.rows;

            // Пробегаемся по задачам и сопоставляем с пользователями
            return tasks.map(task => {
                const user = users.find(u => u.id === task.user_id);
                return {
                    id: task.id,
                    description: task.description,
                    user_id: task.user_id,
                    created_at: task.created_at,
                    user_name: user ? user.name : null, // Имя пользователя добавляется в результирующий объект, но не в базу данных
                };
            });
        },
        users: async () => {
            // Получаем пользователей из базы данных DistUsers
            const userResult = await userPool.query(`SELECT id, name FROM users`);
            return userResult.rows; // Возвращаем пользователей
        },
    },
    Mutation: {
        addTask: async (_, { description, userId }) => {
            // Добавляем новую задачу в DistTasks
            const result = await taskPool.query(
                'INSERT INTO tasks (description, user_id) VALUES ($1, $2) RETURNING *',
                [description, userId]
            );
            const task = result.rows[0];

            // Возвращаем добавленную задачу
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
