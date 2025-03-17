import { Hono } from "hono";
import { getSalesHistoryController, getBuyerHistoryController } from "../Sales/index.js";

const router = new Hono()
  .get('/api/Sales/SalesHistory', getSalesHistoryController)
  .get('/api/Sales/BuyerHistory', getBuyerHistoryController);

export default router