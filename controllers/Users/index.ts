import { type Context } from "hono"
import { getUsersData } from "../../data/Users.js";

export function getUsersController(c: Context) {
  return getUsersData(c);
}