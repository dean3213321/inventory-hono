import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUsersData(c: Context) {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        position: {
          notIn: ['Student', 'Gatepass', 'Intern'],
        },
        isactive: 1,
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        position: true,
        isactive: true,
      },
    });

    return c.json(teachers);
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return c.json({ error: "Failed to fetch teacher data" }, 500);
  }
}
