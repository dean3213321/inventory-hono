import { type Context, type Next } from "hono";



export async function authenticationMiddleware(c: Context, next: Next ) {
 const accessToken = c.req.header('Authorization')?.split("Bearer ")[1]
   
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  
    await next()
}