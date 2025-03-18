import { type  Context } from "hono"
import { 
  getUserNameData, 
  subItemQuantityData, 
  getTopSoldItemsData, 
  getExistingBuyersData, 
  getRevenueData,
  createSalesIdData,
  createSalesNoIdData
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

export function createSalesIdController(c: Context) {
  return createSalesIdData(c);
}

export function createSalesNoIdController(c: Context) {
  return createSalesNoIdData(c);
}