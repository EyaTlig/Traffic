const express = require('express');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_2024';

function getUser(token) {
  if (!token) return null;
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  try {
    return jwt.verify(raw, JWT_SECRET);
  } catch {
    return null;
  }
}

async function start() {
  const app = express();
  app.use(express.json());

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // ── HTTP server (shared by Express & WebSocket) ──────────────────────────
  const httpServer = http.createServer(app);

  // ── WebSocket server for GraphQL Subscriptions ───────────────────────────
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx) => {
        // Auth via connectionParams: { authorization: "Bearer <token>" }
        const token =
          ctx.connectionParams?.authorization ||
          ctx.connectionParams?.Authorization ||
          '';
        return { user: getUser(token) };
      },
      onConnect: (ctx) => {
        const token =
          ctx.connectionParams?.authorization ||
          ctx.connectionParams?.Authorization ||
          '';
        if (!getUser(token)) {
          throw new Error('Unauthorized: invalid or missing token');
        }
        console.log('WS client connected');
      },
      onDisconnect: () => console.log('WS client disconnected'),
    },
    wsServer
  );

  // ── Apollo Server (HTTP / Query & Mutation) ───────────────────────────────
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (err) => ({ message: err.message }),
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: getUser(req.headers.authorization || ''),
      }),
    })
  );

  const port = process.env.PORT || 3005;
  httpServer.listen(port, () => {
    console.log(`Notification service → http://localhost:${port}/graphql`);
    console.log(`WebSocket (Subscriptions) → ws://localhost:${port}/graphql`);
  });
}

start().catch(console.error);