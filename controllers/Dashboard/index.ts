import { type  Context } from "hono"
import { 
  getUserNameData, 
  subItemQuantityData, 
  getTopSoldItemsData, 
  getExistingBuyersData, 
  getRevenueData,
  createSalesData
} from "../../data/Dashboard.js"


export function getUserNameController(c: Context) {
  return getUserNameData(c);
}

export function subItemQuantityController(c: Context) {
  return subItemQuantityData(c);
}

export function getTopSoldItemsController(c: Context) {
  return getTopSoldItemsData(c);
}

export function getExistingBuyersController(c: Context) {
  return getExistingBuyersData(c);
}

export function getRevenueController(c: Context) {
  return getRevenueData(c);
}

export function createSalesController(c: Context) {
  return createSalesData(c);
}

