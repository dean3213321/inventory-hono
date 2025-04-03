import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function getSuppliersData(c: Context) {
    try {
        const suppliers = await prisma.inventory__suppliers.findMany({
            select: {
                id: true,
                companyName: true,
                itemsProvided: true,
                address: true,
                phoneNumber: true,
                email: true,
                rating: true,
            },
        });
        return c.json(suppliers);
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        return c.json({ error: "Failed to fetch suppliers" }, 500);
    }
}

export async function createSupplierData(c: Context) {
    const { companyName, itemsProvided, address, phoneNumber, email, rating } = await c.req.json();

    // Basic validation
    if (!companyName) {
        return c.json({ error: "Company name is required." }, 400);
    }

    try {
        const newSupplier = await prisma.inventory__suppliers.create({
            data: {
                companyName: companyName,
                itemsProvided: itemsProvided,
                address: address,
                phoneNumber: phoneNumber,
                email: email,
                rating: rating,
            },
        });
        return c.json(newSupplier, 201);
    } catch (err) {
        console.error("Error adding supplier:", err);
        return c.json({ error: "Failed to add supplier" }, 500);
    }
}