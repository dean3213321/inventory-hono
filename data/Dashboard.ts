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

//fetch buyer names for drop inside the modal
export async function getExistingBuyersData(c: Context) {
  try {
    const buyers = await prisma.buyers.findMany({
      select: {
        buyer_id: true,
        buyer_name: true, // Use `buyer_name` instead of `fname` and `lname`
      },
    });

    // Map the response to match the expected format in the frontend
    const formattedBuyers = buyers.map((buyer) => ({
      buyer_id: buyer.buyer_id,
      fname: buyer.buyer_name.split(' ')[0], // Extract first name
      lname: buyer.buyer_name.split(' ')[1] || '', // Extract last name (if exists)
    }));

    return c.json(formattedBuyers);
  } catch (error) {
    console.error("Error fetching existing buyers:", error);
    return c.json({ error: "Failed to fetch existing buyers" }, 500);
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


export async function createSalesHistoryData(c: Context) {
  try {
    const { buyerName, itemsBought } = await c.req.json();

    // Validate the payload
    if (!buyerName || !Array.isArray(itemsBought)) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    // Check if the buyer already exists
    let buyer = await prisma.buyers.findUnique({
      where: { buyer_name: buyerName },
    });

    // If the buyer doesn't exist, create a new buyer
    if (!buyer) {
      try {
        buyer = await prisma.buyers.create({
          data: { buyer_name: buyerName },
        });
      } catch (error) {
        // Handle unique constraint violation (P2002)
        if ((error as any).code === 'P2002') {
          // If the buyer already exists, fetch the existing buyer
          buyer = await prisma.buyers.findUnique({
            where: { buyer_name: buyerName },
          });
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    }

    // Ensure buyer is not null
    if (!buyer) {
      return c.json({ error: "Buyer not found" }, 404);
    }

    // Prepare sales history records for each item
    const salesRecords = itemsBought.map((item: { product_name: string; quantity: number }) => ({
      buyer_id: buyer.buyer_id, // Link to the buyer
      product_name: item.product_name,
      quantity: item.quantity,
      // sale_date will default to the current timestamp as defined in your schema
    }));

    // Insert all records in one batch
    await prisma.sales_history.createMany({
      data: salesRecords,
    });

    return c.json({ message: "Sales history recorded successfully" });
  } catch (error) {
    console.error("Error creating sales history:", error);
    return c.json({ error: "Failed to create sales history" }, 500);
  }
}

// Endpoint to fetch top 5 sold items
export async function getTopSoldItemsData(c: Context) {
  try {
    const topSoldItems = await prisma.sales_history.groupBy({
      by: ['product_name'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const formattedData = topSoldItems.map(item => ({
      product_name: item.product_name,
      total_quantity: item._sum.quantity || 0,
    }));

    return c.json(formattedData);
  } catch (error) {
    console.error("Error fetching top sold items:", error);
    return c.json({ error: "Failed to fetch top sold items" }, 500);
  }
}
