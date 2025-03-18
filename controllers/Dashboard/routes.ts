import { Hono } from "hono"
import { 
  getUserNameController, 
  subItemQuantityController, 
  getTopSoldItemsController, 
  getExistingBuyersController, 
  getRevenueController, 
  createSalesController
} from "./index.js"

const router = new Hono()
  .post('/api/Dashboard/getname', getUserNameController)
  .put('/api/Dashboard/subitemquantity', subItemQuantityController)
  .get('/api/Dashboard/gettopsolditems', getTopSoldItemsController)
  .get('/api/Dashboard/Buyerdropdown', getExistingBuyersController)
  .get('/api/Dashboard/revenue', getRevenueController)
  .post('/api/Dashboard/sales', createSalesController);


export default router 