import { Hono } from "hono"
import { getUserNameController } from "./index.js"

const router = new Hono()
  .post('/api/Dashboard/getname', getUserNameController);

export default router