import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Endpoint to fetch all sales history records
export async function getSalesHistoryData(c: Context) {
    try {
      // Fetch all sales history records from the database
      const salesHistory = await prisma.saleshistory.findMany();
  
      // Parse the itemsBought field from JSON string to an array (if needed)
      const parsedSalesHistory = salesHistory.map((record) => ({
        ...record,
        itemsBought: JSON.parse(record.itemsBought),
      }));
  
      return c.json({
        message: "Sales history fetched successfully",
        data: parsedSalesHistory,
      });
    } catch (error) {
      console.error("Error fetching sales history:", error);
      return c.json({ error: "Failed to fetch sales history" }, 500);
    } finally {
      await prisma.$disconnect();
    }
  }