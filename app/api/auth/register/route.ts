import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const passwordhash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, passwordhash, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
    }

    throw error;
  }
}
