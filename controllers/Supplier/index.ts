import { type  Context } from "hono"
import { createSupplierData, getSuppliersData } from "../../data/Supplier.js";

export function getSuppliersController(c: Context) {
  return getSuppliersData(c);
}

export function createSupplierController(c: Context) {
    return createSupplierData(c);
}