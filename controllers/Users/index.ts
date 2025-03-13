import { type  Context } from "hono"
import { getInventoryProductsData } from "../../data/Users.js";

export function getUsersController(c: Context) {
  return getInventoryProductsData(c);
}