const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// Version simplifiée sans JWT pour tester
async function start() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Version simplifiée - pas de JWT pour le test
      return { user: null, req };
    },
    formatError: (err) => {
      console.error('GraphQL Error:', err.message);
      return { message: err.message };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`\n🚦 Gateway ready → http://localhost:${port}/graphql`);
  });
}

start().catch(console.error);