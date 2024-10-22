const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');
const cors = require('cors');


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DistTasks',
  password: 'Serik2004',
  port: 5432,
});

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

const app = express();
app.use(cors());
app.use(session({
  secret: 'SekaNeedCode',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));
app.use(keycloak.middleware());

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

const resolvers = {
  Query: {
    tasks: async () => {
      const tasksResult = await pool.query('SELECT * FROM tasks');
      return tasksResult.rows;
    },
  },
  Mutation: {
    addTask: async (_, { description, user_id }) => {
      const result = await pool.query(
        'INSERT INTO tasks (description, user_id) VALUES ($1, $2) RETURNING *',
        [description, user_id]
      );
      return result.rows[0];
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  server.applyMiddleware({ app });

  const token = jwt.sign({ user: 'testUser' }, 'your_secret_key', { expiresIn: '1h' });
  console.log('Generated Token:', token);

  app.listen({ port: 3500 }, () =>
    console.log(`Task Service running at http://localhost:3500${server.graphqlPath}`)
  );
});
