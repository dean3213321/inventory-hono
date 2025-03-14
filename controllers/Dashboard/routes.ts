import { Hono } from "hono"
import { getUserNameController, subItemQuantityController } from "./index.js"

const router = new Hono()
  .post('/api/Dashboard/getname', getUserNameController)
  .put('/api/Dashboard/subitemquantity', subItemQuantityController);

export default router