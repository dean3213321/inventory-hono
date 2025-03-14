import productsRouter from './Products/routes.js';
import userRoutes from './Users/routes.js';

export const routes = [userRoutes, productsRouter] as const

export type AppRoutes = typeof routes[number];