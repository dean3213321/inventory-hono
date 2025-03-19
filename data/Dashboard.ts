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

//fetch buyer names for drop inside the modal, only those WITHOUT RFID
export async function getExistingBuyersData(c: Context) {
  try {
    const buyers = await prisma.buyers.findMany({
      where: {
        rfid: null, // Filter for buyers without an RFID
      },
      select: {
        buyer_id: true,
        buyer_name: true,
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

export async function createSalesData(c: Context) {
  try {
    const { buyerName, itemsBought, rfid } = await c.req.json();

    // Validate the payload
    if (!buyerName || !Array.isArray(itemsBought)) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    // Check if the buyer already exists
    let buyer = await prisma.buyers.findFirst({
      where: { buyer_name: buyerName },
    });

    // If the buyer doesn't exist, create a new buyer
    if (!buyer) {
      buyer = await prisma.buyers.create({
        data: { 
          buyer_name: buyerName,
          rfid: rfid ? BigInt(rfid) : null, // Include RFID if provided
        },
      });
    } else if (rfid && buyer.rfid === null) {
      // If the buyer exists and RFID is provided, update the buyer's RFID
      buyer = await prisma.buyers.update({
        where: { buyer_id: buyer.buyer_id },
        data: { rfid: BigInt(rfid) },
      });
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
      rfid: rfid ? BigInt(rfid) : null, // Include RFID if provided
      // sale_date will default to the current timestamp as defined in your schema
    }));

    // Insert all records in one batch
    await prisma.sales_history.createMany({
      data: salesRecords,
    });

    return c.json({ message: "Sales history recorded successfully" });
  } catch (error) {
    console.error("Error creating sales history:", error);

    // Handle unique constraint violation (P2002)
    if ((error as any).code === 'P2002') {
      return c.json({ error: "Buyer already exists" }, 400);
    }

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

export async function getRevenueData(c: Context) {
  try {
    const period = c.req.query('period'); // Get period from query parameter (day, week, month)
    const currentDate = new Date();

    let startDate: Date;
    let endDate: Date = currentDate;

    switch (period) {
      case 'day':
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly-revenue':
        // Calculate weekly revenue for the past 4 weeks
        const weeklyRevenue = [];
        for (let i = 0; i < 4; i++) {
          const weekStartDate = new Date(currentDate);
          weekStartDate.setDate(currentDate.getDate() - currentDate.getDay() - 7 * i);
          weekStartDate.setHours(0, 0, 0, 0);

          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekStartDate.getDate() + 6);
          weekEndDate.setHours(23, 59, 59, 999);

          const salesHistory = await prisma.sales_history.findMany({
            where: {
              sale_date: {
                gte: weekStartDate,
                lte: weekEndDate,
              },
            },
            include: {
              buyers: {
                select: {
                  buyer_name: true,
                },
              },
            },
          });

          const productNames = salesHistory.map(sale => sale.product_name);
          const inventoryItems = await prisma.inventory_bookstore.findMany({
            where: {
              product_name: {
                in: productNames,
              },
            },
            select: {
              product_name: true,
              selling_price: true,
            },
          });

          const priceMap = new Map();
          inventoryItems.forEach(item => {
            priceMap.set(item.product_name, item.selling_price);
          });

          const weeklyRevenueTotal = salesHistory.reduce((total, sale) => {
            const sellingPrice = priceMap.get(sale.product_name) || 0;
            return total + sale.quantity * sellingPrice;
          }, 0);

          weeklyRevenue.push(weeklyRevenueTotal);
        }

        return c.json({
          period: 'weekly-revenue',
          weeklyRevenue,
        });
      default:
        return c.json({ error: "Invalid period. Use 'day', 'week', or 'month'." }, 400);
    }

    // Fetch sales history data within the specified period
    const salesHistory = await prisma.sales_history.findMany({
      where: {
        sale_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        buyers: {
          select: {
            buyer_name: true,
          },
        },
      },
    });

    // Fetch selling prices for all products in the sales history
    const productNames = salesHistory.map(sale => sale.product_name);
    const inventoryItems = await prisma.inventory_bookstore.findMany({
      where: {
        product_name: {
          in: productNames,
        },
      },
      select: {
        product_name: true,
        selling_price: true,
      },
    });

    // Create a map of product names to selling prices
    const priceMap = new Map();
    inventoryItems.forEach(item => {
      priceMap.set(item.product_name, item.selling_price);
    });

    // Calculate revenue for each day of the week
    const dailyRevenue = Array(7).fill(0);
    salesHistory.forEach(sale => {
      const saleDay = sale.sale_date ? new Date(sale.sale_date).getDay() : -1; // -1 for null dates
      const sellingPrice = priceMap.get(sale.product_name) || 0; // Default to 0 if price not found
      dailyRevenue[saleDay] += sale.quantity * sellingPrice;
    });

    // Format the response
    const formattedSalesHistory = salesHistory.map((sale) => ({
      sale_id: sale.sale_id,
      buyer_name: sale.buyers?.buyer_name || 'Unknown Buyer',
      product_name: sale.product_name,
      quantity: sale.quantity,
      sale_date: sale.sale_date,
    }));

    return c.json({
      period,
      startDate,
      endDate,
      dailyRevenue,
      salesHistory: formattedSalesHistory,
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return c.json({ error: "Failed to calculate revenue" }, 500);
  }
}