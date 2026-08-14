"use server";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function deleteReading (readingId : string, _formdata: FormData){
    const session = await auth();
    if(!session?.user){
        throw new Error("No autenticado");
    }

    await prisma.reading.deleteMany({
        where: {id:readingId, userId:session.user.id

        },
    });

    revalidatePath("/readings");
}