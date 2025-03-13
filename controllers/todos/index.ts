import { Hono, type Context  } from "hono"
import { getTodoData, getTodosData, createTodoData, updateTodoData, deleteTodoData } from "../../data/todos.js";


const router = new Hono()

export function getTodosController(c: Context) {
  return getTodosData(c);
}

export function getTodoController(c: Context) {
  return getTodoData(c);
}

export function createTodoController(c: Context) {
  return createTodoData(c);
}

export function updateTodoController(c: Context) {
  return updateTodoData(c);
}

export function deleteTodoController(c: Context) {
  return deleteTodoData(c);
}

export default router

