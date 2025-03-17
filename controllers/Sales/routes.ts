import { Hono } from "hono";
import { getSalesHistoryController } from "../Sales/index.js";

const router = new Hono()
  .get('/api/Sales/SalesHistory', getSalesHistoryController);

export default router