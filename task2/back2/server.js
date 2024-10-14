const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');
const fetch = require('cross-fetch'); 

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DistTasks',
  password: 'Serik2004',
  port: 5432,
});

// GraphQL схема
const typeDefs = gql`
  type Task {
    id: ID!
    description: String!
    user_id: Int!
    userName: String
    created_at: String
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    addTask(description: String!, user_id: Int!): Task
  }
`;

const getUserName = async (user_id) => {
  const response = await fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query User($id: ID!) { user(id: $id) { name } }`,
      variables: { id: user_id },
    }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении пользователя');
  }

  const user = await response.json();
  return user.data.user.name; 
};

// GraphQL резолверы
const resolvers = {
  Query: {
    tasks: async () => {
      const result = await pool.query('SELECT * FROM tasks');
      const tasks = result.rows;

      // Получаем имена пользователей для каждой задачи
      const tasksWithUserNames = await Promise.all(
        tasks.map(async (task) => {
          const userName = await getUserName(task.user_id);
          return {
            ...task,
            userName, // Подставляем имя пользователя
          };
        })
      );
      return tasksWithUserNames;
    },
  },
  Mutation: {
    addTask: async (_, { description, user_id }) => {
      const result = await pool.query(
        'INSERT INTO tasks (description, user_id) VALUES ($1, $2) RETURNING *',
        [description, user_id]
      );
      const newTask = result.rows[0];

      const userName = await getUserName(user_id);

      return {
        ...newTask,
        userName,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.start().then(() => {
  server.applyMiddleware({ app });

  app.listen({ port: 3500 }, () =>
    console.log(`Task Service running at http://localhost:3500${server.graphqlPath}`)
  );
});
