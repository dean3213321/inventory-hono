import productsRouter from './Products/routes.js';
import userRoutes from './Users/routes.js';
import dashboardRoutes from './Dashboard/routes.js';

export const routes = [userRoutes, productsRouter, dashboardRoutes] as const

export type AppRoutes = typeof routes[number];