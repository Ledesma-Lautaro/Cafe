"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const createPurchaseSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  date: z.coerce.date(),
});

export async function createPurchase(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const parsed = createPurchaseSchema.safeParse({
    userId: formData.get("userId"),
    productId: formData.get("productId"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: parsed.data.productId },
  });

  await prisma.purchase.create({
    data: { ...parsed.data, amount: product.price },
  });

  revalidatePath("/admin");
  revalidatePath("/profile");
}