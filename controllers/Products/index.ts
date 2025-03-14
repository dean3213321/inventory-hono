import { type  Context } from "hono"
import { getInventoryProductsData, createInventoryProductData, updateInventoryProductData, deleteInventoryProductData, getInventoryTotalData, getInventoryLowData } from "../../data/Products.js";


export function getInventoryProductsController(c: Context) {
  return getInventoryProductsData(c);
}
export function createInventoryProductController(c: Context) {
  return createInventoryProductData(c);
}
export function updateInventoryProductController(c: Context) {
  return updateInventoryProductData(c);
}
export function deleteInventoryProductController(c: Context) {
  return deleteInventoryProductData(c);
}
export function getInventoryTotalController(c: Context) {
  return getInventoryTotalData(c);
}
export function getInventoryLowController(c: Context) {
  return getInventoryLowData(c);
}
