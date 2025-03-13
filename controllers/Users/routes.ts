import { Hono } from 'hono'
import { getUsersController } from './index.js'


const router = new Hono()
    .get('/api/Users', getUsersController)

export default router