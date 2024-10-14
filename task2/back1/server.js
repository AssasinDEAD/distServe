const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');

// Настройка подключения к базе данных PostgreSQL DistUsers
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DistUsers',
  password: 'Serik2004', // Замени на свой пароль
  port: 5432,
});

// GraphQL схема
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    addUser(name: String!): User
    deleteUser(id: ID!): Boolean
  }
`;

// Резолверы
const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    },
    user: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    },
  },
  Mutation: {
    addUser: async (_, { name }) => {
      const result = await pool.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name]);
      return result.rows[0];
    },
    deleteUser: async (_, { id }) => {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    },
  },
};

// Настройка Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.start().then(() => {
  server.applyMiddleware({ app });

  app.listen({ port: 3000 }, () =>
    console.log(`User Service running at http://localhost:3000${server.graphqlPath}`)
  );
});
