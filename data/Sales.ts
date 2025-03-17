// Hono route (server-side)
import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Endpoint to fetch all sales history records
export async function getSalesHistoryData(c: Context) {
  try {
    // Fetch sales history data with buyer details
    const salesHistory = await prisma.sales_history.findMany({
      include: {
        buyers: {
          select: {
            buyer_name: true, // Include the buyer's name
          },
        },
      },
      orderBy: {
        sale_date: 'desc', // Order by sale date (most recent first)
      },
    });

    // Format the response
    const formattedSalesHistory = salesHistory.map((sale) => ({
      sale_id: sale.sale_id,
      buyer_name: sale.buyers?.buyer_name || 'Unknown Buyer', // Fallback for null buyer
      product_name: sale.product_name,
      quantity: sale.quantity,
      sale_date: sale.sale_date,
    }));

    return c.json({ salesHistory: formattedSalesHistory });
  } catch (error) {
    console.error("Error fetching sales history:", error);
    return c.json({ error: "Failed to fetch sales history" }, 500);
  }
}


// New endpoint to fetch sales history for a specific buyer
export async function getBuyerHistoryData(c: Context) {
  try {
    const buyerName = c.req.query('buyerName'); // Get buyerName from query parameter

    if (!buyerName) {
      return c.json({ error: "Buyer name is required" }, 400);
    }

    const salesHistory = await prisma.sales_history.findMany({
      where: {
        buyers: {
          buyer_name: buyerName,
        },
      },
      orderBy: {
        sale_date: 'desc',
      },
       include: {
        buyers: {
          select: {
            buyer_name: true, // Include the buyer's name
          },
        },
      },
    });

     const formattedSalesHistory = salesHistory.map((sale) => ({
      sale_id: sale.sale_id,
      buyer_name: sale.buyers?.buyer_name || 'Unknown Buyer', // Fallback for null buyer
      product_name: sale.product_name,
      quantity: sale.quantity,
      sale_date: sale.sale_date,
    }));

    return c.json({ salesHistory: formattedSalesHistory });
  } catch (error) {
    console.error("Error fetching sales history by buyer:", error);
    return c.json({ error: "Failed to fetch sales history by buyer" }, 500);
  }
}