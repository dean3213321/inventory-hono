import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserNameData(c: Context) {
    try {
      const { rfid } = await c.req.json();
  
      const user = await prisma.user.findFirst({
        where: {
          rfid: BigInt(rfid),
        },
        select: {
          fname: true,
          lname: true,
        },
      });
  
      if (!user) {
        return c.json({ error: "Invalid RFID. Please Report to the ICT Department" }, 404);
      }
  
      return c.json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      return c.json({ error: "Failed to fetch user data" }, 500);
    }
  }