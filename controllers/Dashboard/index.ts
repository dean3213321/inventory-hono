import { type  Context } from "hono"
import { getUserNameData, subItemQuantityData } from "../../data/Dashboard.js"

export function getUserNameController(c: Context) {
  return getUserNameData(c);
}

export function subItemQuantityController(c: Context) {
  return subItemQuantityData(c);
}