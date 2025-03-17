import productsRouter from './Products/routes.js';
import userRoutes from './Users/routes.js';
import dashboardRoutes from './Dashboard/routes.js';
import salesRoutes from './Sales/routes.js';

export const routes = [userRoutes, productsRouter, dashboardRoutes, salesRoutes] as const

export type AppRoutes = typeof routes[number];