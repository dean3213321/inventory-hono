import { Hono } from "hono"
import { getUserNameController, subItemQuantityController, createSalesHistoryController, getTopSoldItemsController, getExistingBuyersController } from "./index.js"

const router = new Hono()
  .post('/api/Dashboard/getname', getUserNameController)
  .put('/api/Dashboard/subitemquantity', subItemQuantityController)
  .post('/api/Dashboard/createsaleshistory', createSalesHistoryController)
  .get('/api/Dashboard/gettopsolditems', getTopSoldItemsController)
  .get('/api/Dashboard/Buyerdropdown', getExistingBuyersController)

export default router 