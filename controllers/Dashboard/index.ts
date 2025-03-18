import { type  Context } from "hono"
import { getUserNameData, subItemQuantityData, createSalesHistoryData, getTopSoldItemsData, getExistingBuyersData } from "../../data/Dashboard.js"

export function getUserNameController(c: Context) {
  return getUserNameData(c);
}

export function subItemQuantityController(c: Context) {
  return subItemQuantityData(c);
}

export function createSalesHistoryController(c: Context) {
  return createSalesHistoryData(c);
}

export function getTopSoldItemsController(c: Context) {
  return getTopSoldItemsData(c);
}

export function getExistingBuyersController(c: Context) {
  return getExistingBuyersData(c);
}