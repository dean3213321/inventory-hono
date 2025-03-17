import { type  Context } from "hono"
import { getSalesHistoryData } from "../../data/Sales.js"

export function getSalesHistoryController(c: Context) {
  return getSalesHistoryData(c);
}
