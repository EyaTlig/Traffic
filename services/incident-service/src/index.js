const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_2024';

function getUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function getRawToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

async function start() {
  const app = express();
  const server = new ApolloServer({
    typeDefs, resolvers,
    context: ({ req }) => ({
      user: getUser(req),
      token: getRawToken(req),   // ← token brut pour appeler notification-service
    }),
    formatError: (err) => ({ message: err.message }),
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  const port = process.env.PORT || 3004;
  app.listen(port, () => console.log(`Incident service → http://localhost:${port}/graphql`));
}

start().catch(console.error);