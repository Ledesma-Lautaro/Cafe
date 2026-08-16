import { awardPurchasePoints } from "@/lib/points";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { checkAndUnlockAchievements } from "@/lib/achievements";

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

  const achievements = [
    {
      name: "Primera compra",
      description: "Realizaste tu primera compra en el local",
      conditionType: "FIRST_PURCHASE" as const,
      threshold: 1,
      rewardType: "DISCOUNT_PERCENT" as const,
      rewardDescription: "10% de descuento en tu próxima compra",
    },
    {
      name: "Lector iniciado",
      description: "Registraste 5 lecturas",
      conditionType: "BOOKS_READ" as const,
      threshold: 5,
      rewardType: "FREE_PRODUCT" as const,
      rewardDescription: "Un café gratis",
    },
    {
      name: "Lector frecuente",
      description: "Registraste 10 lecturas",
      conditionType: "BOOKS_READ" as const,
      threshold: 10,
      rewardType: "DISCOUNT_PERCENT" as const,
      rewardDescription: "15% de descuento en tu próxima compra",
    },
    {
      name: "Lector voraz",
      description: "Registraste 20 lecturas",
      conditionType: "BOOKS_READ" as const,
      threshold: 20,
      rewardType: "FREE_PRODUCT" as const,
      rewardDescription: "Una porción de torta gratis",
    },
    {
      name: "Cliente habitual",
      description: "Realizaste 5 compras",
      conditionType: "PURCHASE_COUNT" as const,
      threshold: 5,
      rewardType: "DISCOUNT_PERCENT" as const,
      rewardDescription: "10% de descuento en tu próxima compra",
    },
    {
      name: "Cliente fiel",
      description: "Realizaste 15 compras",
      conditionType: "PURCHASE_COUNT" as const,
      threshold: 15,
      rewardType: "FREE_PRODUCT" as const,
      rewardDescription: "Una medialuna gratis",
    },
    {
      name: "100 puntos",
      description: "Acumulaste 100 puntos",
      conditionType: "TOTAL_POINTS" as const,
      threshold: 100,
      rewardType: "DISCOUNT_PERCENT" as const,
      rewardDescription: "5% de descuento en tu próxima compra",
    },
    {
      name: "500 puntos",
      description: "Acumulaste 500 puntos",
      conditionType: "TOTAL_POINTS" as const,
      threshold: 500,
      rewardType: "FREE_PRODUCT" as const,
      rewardDescription: "Un libro con 20% de descuento",
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

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
      const purchasesCount = Math.floor(Math.random() * 11) + 5;
      for (let i = 0; i < purchasesCount; i++) {
        const product = randomItem(allProducts);
        await prisma.$transaction(async (tx) => {
          const purchase = await tx.purchase.create({
            data: {
              userId: user.id,
              productId: product.id,
              amount: product.price,
              date: randomDateInLastMonths(6),
            },
          });
          await awardPurchasePoints(
            tx,
            user.id,
            purchase.id,
            Number(product.price),
          );
          await checkAndUnlockAchievements(tx, user.id)
        });
      }
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
