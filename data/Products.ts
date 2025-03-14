import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function getInventoryProductsData(c: Context) {
    try {
        const products = await prisma.inventory_bookstore.findMany({
          select: {
            id: true,
            product_name: true,
            quantity: true,
            selling_price: true,
            date: true,
          },
        });
        return c.json(products);
      } catch (err) {
        console.error("Error fetching products:", err);
        return c.json({ error: "Failed to fetch products" }, 500);
      }
}

export async function createInventoryProductData(c: Context) {
  const { product_name, quantity, selling_price } = await c.req.json();

  console.log("Received data:", { product_name, quantity, selling_price }); // ADD THIS

  if (!product_name || quantity === undefined || selling_price === undefined) {
      return c.json({ error: "Item name, quantity, and selling price are required." }, 400);
  }
  if (isNaN(quantity) || isNaN(selling_price)) {
      return c.json({ error: "Quantity and selling price must be valid numbers." }, 400);
  }

  try {
      const newProduct = await prisma.inventory_bookstore.create({
          data: {
              product_name: product_name,
              quantity: quantity,
              selling_price: selling_price,
              date: new Date(),
          },
      });
      return c.json(newProduct, 201);
  } catch (err) {
      console.error("Error adding product:", err);
      return c.json({ error: "Failed to add product" }, 500);
  }
}

export async function updateInventoryProductData(c: Context) {
  const productId = parseInt(c.req.param('id'), 10);
  const { product_name, quantity, selling_price } = await c.req.json();  // Corrected key: item -> product_name

  if (isNaN(selling_price)) {
      console.error("Invalid selling price:", selling_price);
      return c.json({ error: "Selling price must be a valid number." }, 400);
  }
  // No need to check quantity or product_name here. Let the try-catch handle the DB error.

  try {
      const updatedProduct = await prisma.inventory_bookstore.update({
          where: { id: productId },
          data: {
              product_name: product_name, // Use correct database field name
              quantity: quantity,
              selling_price: selling_price,
          },
      });
      return c.json({ message: "Product updated successfully" });
  } catch (err) {
      console.error("Error updating product:", err);
      return c.json({ error: "Failed to update product" }, 500);
  }
}

export async function deleteInventoryProductData(c: Context) {
    const productId = parseInt(c.req.param('id'), 10);

  try {
    await prisma.inventory_bookstore.delete({
      where: { id: productId },
    });
    return c.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return c.json({ error: "Failed to delete product" }, 500);
  }
}

export async function getInventoryTotalData(c: Context) {
    try {
        const totalSupplies = await prisma.inventory_bookstore.aggregate({
          _sum: {
            quantity: true,
          },
        });
        return c.json({ totalSupplies: totalSupplies._sum.quantity || 0 });
      } catch (err) {
        console.error("Error fetching total supplies:", err);
        return c.json({ error: "Failed to fetch total supplies" }, 500);
      }
}

export async function getInventoryLowData(c: Context) {
    try {
        const lowStockItems = await prisma.inventory_bookstore.count({
          where: {
            quantity: {
              lte: 10,
            },
          },
        });
        return c.json({ lowStockItems });
      } catch (err) {
        console.error("Error fetching low stock items:", err);
        return c.json({ error: "Failed to fetch low stock items" }, 500);
      }
}