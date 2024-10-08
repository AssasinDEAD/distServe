// src/apolloClient.js
import { ApolloClient, InMemoryCache } from '@apollo/client';

// Client for users service (http://localhost:3000/graphql)
export const userClient = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

// Client for tasks service (http://localhost:3500/graphql)
export const taskClient = new ApolloClient({
  uri: 'http://localhost:3500/graphql',
  cache: new InMemoryCache(),
});
