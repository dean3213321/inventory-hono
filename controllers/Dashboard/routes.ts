import { Hono } from "hono"
import { getUserNameController, subItemQuantityController, createSalesHistoryController } from "./index.js"

const router = new Hono()
  .post('/api/Dashboard/getname', getUserNameController)
  .put('/api/Dashboard/subitemquantity', subItemQuantityController)
  .post('/api/Dashboard/createsaleshistory', createSalesHistoryController);

export default router