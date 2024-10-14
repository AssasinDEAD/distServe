import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';

export const taskClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3500/graphql', fetch }),
  cache: new InMemoryCache(),
});

export const userClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3000/graphql', fetch }),
  cache: new InMemoryCache(),
});
