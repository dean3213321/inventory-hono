import todosRoutes from './todos/routes.js';
import userRoutes from './Users/routes.js';

export const routes = [todosRoutes, userRoutes] as const

export type AppRoutes = typeof routes[number];