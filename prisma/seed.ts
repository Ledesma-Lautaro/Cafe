import { awardPurchasePoints } from "@/lib/points";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { searchGoogleBooks } from "@/lib/google-books";
import {
  generateEmbedding,
  saveBookEmbedding,
  bookEmbeddingText,
} from "@/lib/embeddings";
import { awardReadingPoints } from "@/lib/points";
import { fetchWikipediaArticle } from "@/lib/wikipedia";

const WIKIPEDIA_ARTICLES: Record<string, string> = {
  "9780755379927": "American Gods",
  "9788439728801": "Americanah",
  "9781482615425": "Ana Karenina",
  "9788415594048": "Bajo la misma estrella",
  "9788484327899": "Brevísima historia del tiempo",
  "9788439731764": "Cien años de soledad",
  "9788418174438": "Coraline",
  "9788491054870": "Crimen y castigo",
  "9789505470006": "Crónicas marcianas",
  "9788445077948": "El hobbit",
  "9788490691779": "El camino de los reyes",
  "9788415631804": "El cuento de la criada",
  "9788434501782": "El gen egoísta",
  "9788408231363": "The Lion, the Witch and the Wardrobe",
  "9788401023965": "El nombre del viento",
  "9788490695289": "El problema de los tres cuerpos",
  "9788466658843": "Elantris",
  "9786073177443": "Fahrenheit 451",
  "9786073123662": "Juego de tronos",
  "9788483837108": "Kafka en la orilla",
  "9788497592192": "La casa de los espíritus",
  "9788447300099": "La historia interminable",
  "9788420476452": "Los detectives salvajes",
  "9788420683409": "Los miserables",
  "9788413625652": "Los orígenes del totalitarismo",
  "9788445075951": "Neuromante",
  "9788467009248": "Odisea",
  "9788583866343": "Orgullo y prejuicio",
  "9788419233790": "Pedro Páramo",
  "9788499922072": "Pensar rápido, pensar despacio",
  "9788499084367": "Serie de la Fundación",
  "9788466367677": "Un mundo feliz",
  "9788432303326": "Vigilar y castigar",
  "9788435033022": "Yo, robot",
  "9788445008492": "¿Sueñan los androides con ovejas eléctricas?",

  // corregidos a mano (desambiguación o variante de título)
  "9788408143086": "La chica del tren (novela)",
  "9788489666153": "Rayuela (novela)",
  "9786073114417": "El alquimista (novela)",
  "9788408060154": "El mundo y sus demonios",
  "9786070782824": "El ojo del mundo",
  "9788445077498": "La Comunidad del Anillo",
  "9788499926643": "Homo Deus: Breve historia del mañana",
  "9786558944683": "Madame Bovary",
  "9780812416299": "1984 (novela)",
  "9786073184762": "Sapiens: De animales a dioses",
  "9788483836712": "Tokio blues (Norwegian Wood)",
};

const CATALOG_ISBNS: Record<string, string[]> = {
  fantasia: [
    "9788445077498",
    "9788445077948",
    "9788417951610",
    "9788401023965",
    "9786073123662",
    "9788408231363",
    "9788447300099",
    "9788466658843",
    "9788490691779",
    "9780755379927",
    "9788418174438",
    "9786070782824",
  ],
  cienciaFiccion: [
    "9788445008492",
    "9788499084367",
    "9788435033022",
    "9780812416299",
    "9788466367677",
    "9786073177443",
    "9789505470006",
    "9788490695289",
    "9788445075951",
  ],
  clasicos: [
    "9788467009248",
    "9788439731764",
    "9788491054870",
    "9786558944683",
    "9788583866343",
    "9788420683409",
    "9781482615425",
    "9788489666153",
    "9788419233790",
  ],
  contemporanea: [
    "9788415594048",
    "9786073114417",
    "9788408143086",
    "9788420476452",
    "9788497592192",
    "9788483837108",
    "9788483836712",
    "9788415631804",
    "9788439728801",
  ],
  ensayo: [
    "9780829771213",
    "9786073184762",
    "9788499926643",
    "9788484327899",
    "9788434501782",
    "9788499922072",
    "9788449328176",
    "9788408060154",
    "9788413625652",
    "9788432303326",
  ],
};

const DEMO_PROFILES: {
  email: string;
  name: string;
  mix: { theme: string; count: number; rating: number }[];
}[] = [
  {
    email: "ana@demo.com",
    name: "Ana García",
    mix: [
      { theme: "fantasia", count: 5, rating: 5 },
      { theme: "contemporanea", count: 2, rating: 4 },
    ],
  },
  {
    email: "bruno@demo.com",
    name: "Bruno Pérez",
    mix: [
      { theme: "cienciaFiccion", count: 6, rating: 5 },
      { theme: "clasicos", count: 1, rating: 2 },
    ],
  },
  {
    email: "carla@demo.com",
    name: "Carla Díaz",
    mix: [
      { theme: "clasicos", count: 5, rating: 5 },
      { theme: "contemporanea", count: 2, rating: 4 },
    ],
  },
  {
    email: "diego@demo.com",
    name: "Diego Ruiz",
    mix: [
      { theme: "cienciaFiccion", count: 5, rating: 5 },
      { theme: "ensayo", count: 2, rating: 4 },
    ],
  },
  {
    email: "elena@demo.com",
    name: "Elena Sosa",
    mix: [
      { theme: "contemporanea", count: 5, rating: 5 },
      { theme: "clasicos", count: 1, rating: 4 },
      { theme: "fantasia", count: 1, rating: 2 },
    ],
  },
  {
    email: "fabian@demo.com",
    name: "Fabián Molina",
    mix: [
      { theme: "ensayo", count: 5, rating: 5 },
      { theme: "cienciaFiccion", count: 1, rating: 4 },
      { theme: "fantasia", count: 1, rating: 1 },
    ],
  },
  {
    email: "gabi@demo.com",
    name: "Gabi Torres",
    mix: [
      { theme: "fantasia", count: 4, rating: 5 },
      { theme: "cienciaFiccion", count: 2, rating: 4 },
      { theme: "ensayo", count: 1, rating: 2 },
    ],
  },
  {
    email: "hugo@demo.com",
    name: "Hugo Vega",
    mix: [
      { theme: "fantasia", count: 2, rating: 5 },
      { theme: "ensayo", count: 2, rating: 3 },
      { theme: "clasicos", count: 2, rating: 2 },
    ],
  },
];

async function seedDemoReadings(booksByTheme: Record<string, string[]>) {
  for (const [profileIndex, profile] of DEMO_PROFILES.entries()) {
    const user = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (!user) {
      continue;
    }

    const hasReadings = await prisma.reading.findFirst({
      where: { userId: user.id },
    });
    if (hasReadings) {
      continue;
    }

    const picked: { bookId: string; rating: number }[] = [];
    const used = new Set<string>();

    profile.mix.forEach(({ theme, count, rating }) => {
      const pool = booksByTheme[theme] ?? [];
      if (pool.length === 0) { return; }

      let taken = 0;
      for (let i = 0; i < pool.length && taken < count; i++) {
        const bookId = pool[(i + profileIndex) % pool.length];
        if (used.has(bookId)) { continue; }
        used.add(bookId);
        picked.push({ bookId, rating });
        taken++;
      }
    });

    for (const item of picked) {
      await prisma.$transaction(async (tx) => {
        const reading = await tx.reading.create({
          data: {
            userId: user.id,
            bookId: item.bookId,
            date: randomDateInLastMonths(12),
            rating: item.rating,
          },
        });
        await awardReadingPoints(tx, user.id, reading.id);
        await checkAndUnlockAchievements(tx, user.id);
      });
    }
  }
}

async function seedCatalog(): Promise<Record<string, string[]>> {
  const booksByTheme: Record<string, string[]> = {};

  for (const [theme, isbns] of Object.entries(CATALOG_ISBNS)) {
    booksByTheme[theme] = [];

    for (const isbn of isbns) {
      const existing = await prisma.book.findUnique({ where: { isbn } });
      if (existing) {
        booksByTheme[theme].push(existing.id);
        continue;
      }

      const [result] = await searchGoogleBooks(`isbn:${isbn}`, 1);
      if (!result) {
        console.warn(`Sin resultados para isbn:${isbn}`);
        continue;
      }
      if (result.isbn !== isbn) {
        console.warn(
          `ISBN no coincide: pedido ${isbn}, recibido ${result.isbn ?? "ninguno"} (${result.title})`,
        );
        continue;
      }

      const book = await prisma.book.create({
        data: {
          title: result.title,
          author: result.author,
          isbn: result.isbn,
          genre: result.genre,
          synopsis: result.synopsis,
        },
      });
      booksByTheme[theme].push(book.id);
    }
  }

  return booksByTheme;
}

async function generateMissingEmbeddings() {
  const pending = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      author: string;
      genre: string | null;
      synopsis: string | null;
    }[]
  >`SELECT id, title, author, genre, synopsis FROM "Book" WHERE embedding IS NULL`;

  console.log(`Generando embeddings para ${pending.length} libros...`);
  for (const book of pending) {
    const embedding = await generateEmbedding(bookEmbeddingText(book));
    await saveBookEmbedding(book.id, embedding);
  }
}
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

async function enrichFromWikipedia() {
  const pending = await prisma.book.findMany({
    where: {
      isbn: { in: Object.keys(WIKIPEDIA_ARTICLES) },
      synopsisSource: null,
    },
    select: { isbn: true },
  });

  const isbns = pending
    .map((p) => p.isbn!)
    .filter((isbn) => WIKIPEDIA_ARTICLES[isbn]);

  if (isbns.length === 0) {
    console.log("Wikipedia: nada pendiente de enriquecer");
    return;
  }

  console.log(`Enriqueciendo ${isbns.length} libros desde Wikipedia...`);
  let updated = 0;

  for (const isbn of isbns) {
    const article = await fetchWikipediaArticle(WIKIPEDIA_ARTICLES[isbn]);
    if (!article) {
      console.warn(
        `Sin artículo: "${WIKIPEDIA_ARTICLES[isbn]}" (isbn ${isbn})`,
      );
    } else {
      await prisma.book.updateMany({
        where: { isbn },
        data: {
          synopsis: article.text,
          genre: article.description ?? undefined,
          synopsisSource: "wikipedia",
        },
      });
      updated++;
    }
    await new Promise((r) => setTimeout(r, 700));
  }

  await prisma.$executeRaw`
    UPDATE "Book" SET embedding = NULL WHERE "synopsisSource" = 'wikipedia'
  `;

  console.log(`Enriquecidos desde Wikipedia: ${updated}/${isbns.length}`);
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

  for (const demo of DEMO_PROFILES) {
    const passwordhash = await bcrypt.hash("demo1234", 10);
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
          await checkAndUnlockAchievements(tx, user.id);
        });
      }
    }
  }
  const booksByTheme = await seedCatalog();
  await enrichFromWikipedia();
  await generateMissingEmbeddings();
  await seedDemoReadings(booksByTheme);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
