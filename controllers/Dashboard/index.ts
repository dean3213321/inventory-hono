import { type  Context } from "hono"
import { getUserNameData } from "../../data/Dashboard.js"

export function getUserNameController(c: Context) {
  return getUserNameData(c);
}
