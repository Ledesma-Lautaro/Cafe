import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomDateInLastMonths(months: number): Date {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - months);
  const randomTime =
    past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function main() {
  const products = [
    { name: "Café espresso", category: "COFFEE" as const, price: 4000 },
    { name: "Café con leche", category: "COFFEE" as const, price: 5000 },
    { name: "Medialuna", category: "BAKERY" as const, price: 1000 },
    { name: "Porción de torta", category: "BAKERY" as const, price: 5000 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  const book = await prisma.book.upsert({
    where: { isbn: "9788445077498" },
    update: {},
    create: {
      title: "El Señor de los Anillos I. La Comunidad del Anillo",
      author: "J. R. R. Tolkien",
      isbn: "9788445077498",
    },
  });

  await prisma.product.upsert({
    where: { name: book.title },
    update: {},
    create: {
      name: book.title,
      category: "BOOK",
      price: 15000,
      bookId: book.id,
    },
  });

  const allProducts = await prisma.product.findMany();

  const demoUsers = [
    { email: "ana@demo.com", name: "Ana García", password: "demo1234" },
    { email: "bruno@demo.com", name: "Bruno Pérez", password: "demo1234" },
    { email: "carla@demo.com", name: "Carla Díaz", password: "demo1234" },
  ];

  for (const demo of demoUsers) {
    const passwordhash = await bcrypt.hash(demo.password, 10);
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: { email: demo.email, name: demo.name, passwordhash },
    });

    const hasPurchases = await prisma.purchase.findFirst({
      where: { userId: user.id },
    });

    if (!hasPurchases) {
      const purchaseCount = Math.floor(Math.random() * 11) + 5; // entre 5 y 15
      const purchases = Array.from({ length: purchaseCount }, () => {
        const product = randomItem(allProducts);
        return {
          userId: user.id,
          productId: product.id,
          amount: product.price,
          date: randomDateInLastMonths(6),
        };
      });

      await prisma.purchase.createMany({ data: purchases });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
