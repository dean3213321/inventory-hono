import { Hono, type Context } from "hono"
import { getInventoryProductsController, createInventoryProductController, updateInventoryProductController, deleteInventoryProductController, getInventoryTotalController, getInventoryLowController } from "./index.js"

const router = new Hono()
  .get('/api/Products', getInventoryProductsController) // Fetch all products
  .post('/api/Products', createInventoryProductController) // Create a new product
  .put('/api/Products/:id', updateInventoryProductController) // Update a specific product by ID
  .delete('/api/Products/:id', deleteInventoryProductController) // Delete a specific product by ID
  .get('/api/Products/total', getInventoryTotalController) // Get total inventory count
  .get('/api/Products/low-stock', getInventoryLowController); // Get low-stock items

export default router