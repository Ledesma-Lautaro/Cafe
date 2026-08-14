import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const books = (await sql`SELECT id, title, author, isbn FROM "Book"`) as {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
  }[];

  const groups = new Map<string, typeof books>();
  for (const book of books) {
    const key = `${book.title.trim().toLowerCase()}|${book.author.trim().toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), book]);
  }

  const duplicates = [...groups.values()].filter((group) => group.length > 1);

  console.log(`Total de libros: ${books.length}`);
  for (const book of books) {
    console.log(`  - "${book.title}" / "${book.author}" (isbn: ${book.isbn ?? "sin isbn"})`);
  }

  if (duplicates.length === 0) {
    console.log("\nNo se encontraron duplicados.");
  } else {
    console.log(`\nSe encontraron ${duplicates.length} grupo(s) duplicado(s):`);
    console.log(JSON.stringify(duplicates, null, 2));
  }
}

main();
