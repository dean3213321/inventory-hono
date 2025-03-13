import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { cors } from 'hono/cors'; // Add CORS middleware for frontend communication
import { routes } from "../controllers/routes.js";


const app = new Hono();
const prisma = new PrismaClient();

// Add CORS middleware to allow requests from the frontend
app.use('/api/*', cors());

// Check database connection
prisma.$connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });


/* Routes */
routes.forEach((route) => {
  app.route("/", route);
});

// Start the server on port 3000
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});