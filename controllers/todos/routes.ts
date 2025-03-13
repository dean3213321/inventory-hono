import { Hono } from "hono";
import { getTodosController, getTodoController, createTodoController, updateTodoController, deleteTodoController } from "./index.js";
import { authenticationMiddleware } from "../../middleware/authentication.js";


const router = new Hono()
    .get('/todos', authenticationMiddleware, getTodosController)
    .get('/todos/:id', authenticationMiddleware, getTodoController)
    .post('/todos', authenticationMiddleware, createTodoController)
    .put('/todos/:id', authenticationMiddleware, updateTodoController)
    .delete('/todos/:id', authenticationMiddleware, deleteTodoController)

export default router






