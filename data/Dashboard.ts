import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Endpoint to fetch user first and last name by RFID
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
      return c.json(
        { error: "Invalid RFID. Please Report to the ICT Department" },
        404
      );
    }

    return c.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
}

// Endpoint to update product quantities based on cart items
export async function subItemQuantityData(c: Context) {
  try {
    const cartItems: { id: number; quantity: number; product_name: string }[] =
      await c.req.json(); // Expect an array of { id, quantity, product_name }

    // Use a transaction to ensure all updates succeed or fail together
    await prisma.$transaction(
      cartItems.map((item) =>
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

    return c.json({ message: "Quantities updated successfully" });
  } catch (error) {
    console.error("Error updating product quantities:", error);
    return c.json({ error: "Failed to update quantities" }, 500);
  } finally {
    await prisma.$disconnect();
  }
}

// Endpoint to create or update a sales history record with buyer name and items bought
export async function createSalesHistoryData(c: Context) {
  try {
    const { buyerName, itemsBought } = await c.req.json();

    if (!buyerName || !itemsBought) {
      return c.json(
        { error: "buyerName and itemsBought are required" },
        400
      );
    }

    // Check if a record with the same buyerName already exists
    const existingRecord = await prisma.saleshistory.findFirst({
      where: {
        buyerName: buyerName,
      },
    });
    // Ensure itemsBought is stored as a JSON string
    const itemsString =
      typeof itemsBought === "string" ? itemsBought : JSON.stringify(itemsBought);

    if (existingRecord) {
      // If the record exists, parse the existing itemsBought and append the new items
      const existingItems = JSON.parse(existingRecord.itemsBought);
      const newItems = JSON.parse(itemsString);
      const updatedItems = [...existingItems, ...newItems];

      // Update the existing record with the new items
      const updatedRecord = await prisma.saleshistory.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          itemsBought: JSON.stringify(updatedItems),
        },
      });

      return c.json({
        message: "Sales history updated successfully",
        data: updatedRecord,
      });
    } else {
      // If the record does not exist, create a new one
      const historyRecord = await prisma.saleshistory.create({
        data: {
          buyerName,
          itemsBought: itemsString,
        },
      });

      return c.json({
        message: "Sales history saved successfully",
        data: historyRecord,
      });
    }
  } catch (error) {
    console.error("Error saving sales history:", error);
    return c.json({ error: "Failed to save sales history" }, 500);
  } finally {
    await prisma.$disconnect();
  }
}