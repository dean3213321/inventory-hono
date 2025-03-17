import { type  Context } from "hono"
import { getSalesHistoryData, getBuyerHistoryData } from "../../data/Sales.js"


export function getSalesHistoryController(c: Context) {
  return getSalesHistoryData(c);
}

export function getBuyerHistoryController(c: Context) {
  return getBuyerHistoryData(c);
} 

