import { Hono } from "hono";
import { createSupplierController, getSuppliersController } from "./index.js";

const router = new Hono()
  .get('/api/Supplier', getSuppliersController)
  .post('/api/addSupplier', createSupplierController);

export default router