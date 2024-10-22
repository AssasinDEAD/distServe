const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Настройка подключения к базе данных PostgreSQL DistUsers
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DistUsers',
  password: 'Serik2004',  // Замени на свой пароль
  port: 5432,
});

// GraphQL схема
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    age: Int!
    gender: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    addUser(name: String!, password: String!, age: Int!, gender: String!): User
    signIn(name: String!, password: String!): String  # Возвращает сообщение или ошибку
    deleteUser(id: ID!): Boolean
    updateUser(id: ID!, name: String, age: Int, gender: String): User
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
    addUser: async (_, { name, password, age, gender }) => {
      // Хэшируем пароль перед сохранением
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (name, password, age, gender) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, hashedPassword, age, gender]
      );
      return result.rows[0];
    },
    signIn: async (_, { name, password }) => {
      const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
      const user = result.rows[0];

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Возвращаем сообщение об успешном входе
      return 'Successfully signed in!';
    },
    deleteUser: async (_, { id }) => {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    },
    updateUser: async (_, { id, name, age, gender }) => {
      const fields = [];
      const values = [id];

      if (name) {
        fields.push(`name = $${fields.length + 2}`);
        values.push(name);
      }

      if (age) {
        fields.push(`age = $${fields.length + 2}`);
        values.push(age);
      }

      if (gender) {
        fields.push(`gender = $${fields.length + 2}`);
        values.push(gender);
      }

      const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
        values
      );
      return result.rows[0];
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
