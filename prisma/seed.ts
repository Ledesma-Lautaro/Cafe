import { prisma } from "../lib/prisma";

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

  const user = await prisma.user.findFirst();
  if (user) {
    const hasPurchase = await prisma.purchase.findFirst({
      where: { userId: user.id },
    });
    if (!hasPurchase) {
      const coffee = await prisma.product.findFirstOrThrow({
        where: { category: "COFFEE" },
      });
      await prisma.purchase.create({
        data: {
          userId: user.id,
          productId: coffee.id,
          amount: coffee.price,
          date: new Date(),
        },
      });
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
