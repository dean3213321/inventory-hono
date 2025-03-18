// data/Dashboard.ts
import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ... (getUserNameData, getExistingBuyersData, subItemQuantityData remain largely the same)

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

// COMBINED sales creation endpoint
export async function createSalesData(c: Context) {
  try {
    const { buyerName, itemsBought, rfid } = await c.req.json();

    if (!buyerName || !Array.isArray(itemsBought)) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    let buyer;

    if (rfid) {
      // Try to find an existing buyer with the RFID
      buyer = await prisma.buyers.findUnique({
        where: { rfid: BigInt(rfid) },
      });

        if (!buyer) {
            // If no buyer with the RFID exists, find or create by name and update/add RFID
            buyer = await prisma.buyers.findFirst({
                where: { buyer_name: buyerName },
            });

            if(buyer && buyer.rfid === null){ //update existing buyer's rfid
                buyer = await prisma.buyers.update({
                    where: { buyer_id: buyer.buyer_id },
                    data: { rfid: BigInt(rfid) },
                });
            } else if (!buyer) {
                // If no buyer with that name exists, create a new one with the RFID
                buyer = await prisma.buyers.create({
                    data: { buyer_name: buyerName, rfid: BigInt(rfid) },
                });
            }

        }

    } else {
      // No RFID provided, find or create by buyerName
      buyer = await prisma.buyers.findUnique({
        where: { buyer_name: buyerName },
      });

      if (!buyer) {
        buyer = await prisma.buyers.create({
          data: { buyer_name: buyerName }, // No RFID
        });
      }
    }

    if (!buyer) {
      return c.json({ error: "Buyer not found" }, 404); // This shouldn't happen, but good to check
    }

    const salesRecords = itemsBought.map(
      (item: { product_name: string; quantity: number }) => ({
        buyer_id: buyer.buyer_id,
        product_name: item.product_name,
        quantity: item.quantity,
        rfid: rfid ? BigInt(rfid) : null, // Use null if rfid is not provided
      })
    );

    await prisma.sales_history.createMany({
      data: salesRecords,
    });

    return c.json({
      message: "Sales history recorded successfully",
    });

  } catch (error) {
      console.error("Error creating sales history:", error);
    // Prisma-specific error handling (e.g., for unique constraint violations)
    if (error instanceof Error && (error as any).code === 'P2002') {
        return c.json({ error: "A record with this RFID already exists." }, 409); // 409 Conflict
    }
    return c.json({ error: "Failed to create sales history" }, 500);
  }
}

// ... (getTopSoldItemsData, getRevenueData remain the same)
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

        // Calculate total revenue
        const totalRevenue = salesHistory.reduce((sum, sale) => {
            const sellingPrice = priceMap.get(sale.product_name) || 0; // Default to 0 if price not found
            return sum + (sale.quantity * Number(sellingPrice));
        }, 0);

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
            totalRevenue,
            salesHistory: formattedSalesHistory,
        });
    } catch (error) {
        console.error("Error calculating revenue:", error);
        return c.json({ error: "Failed to calculate revenue" }, 500);
    }
}