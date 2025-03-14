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


  export async function subItemQuantityData(c: Context) {
    try {
      const cartItems: { id: number; quantity: number; product_name: string }[] = await c.req.json(); // Array of { id, quantity, product_name }
  
      // Use a transaction to ensure all updates succeed or fail together
      await prisma.$transaction(
        cartItems.map((item: { id: number; quantity: number; product_name: string }) =>
          prisma.inventory_bookstore.update({
            where: { id: item.id },
            data: {
              quantity: {
                decrement: item.quantity, // Decrement the quantity
              },
            },
          })
        )
      );
  
      return c.json({ message: 'Quantities updated successfully' });
    } catch (error) {
      console.error('Error updating product quantities:', error);
      return c.json({ error: 'Failed to update quantities' }, 500);
    } finally {
      await prisma.$disconnect();
    }
  }