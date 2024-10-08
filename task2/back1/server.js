const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');

// Подключение к базе данных DistUsers
const pool = new Pool({
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
        age: Int!
        gender: String!
    }

    type Mutation {
        addUser(name: String!, age: Int!, gender: String!): User
    }

    type Query {
        users: [User]
    }
`;

// Определение резолверов
const resolvers = {
    Query: {
        users: async () => {
            const result = await pool.query('SELECT * FROM users');
            return result.rows;
        },
    },
    Mutation: {
        addUser: async (_, { name, age, gender }) => {
            const result = await pool.query(
                'INSERT INTO users (name, age, gender) VALUES ($1, $2, $3) RETURNING *',
                [name, age, gender]
            );
            return result.rows[0];
        },
    },
};

// Создание и старт сервера Apollo
async function startServer() {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start(); 

    // Применение middleware Express
    server.applyMiddleware({ app });

    // Запуск Express сервера на порту 3000
    app.listen(3000, () => {
        console.log(`User service running on http://localhost:3000${server.graphqlPath}`);
    });
}

// Вызов функции для старта сервера
startServer().catch((error) => {
    console.error('Error starting server:', error);
});
