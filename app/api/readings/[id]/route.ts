import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const updateReadingSchema = z.object ({
    date: z.coerce.date().optional(),
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
});

export async function PATCH (
    request: Request,
    ctx: RouteContext<"/api/readings/[id]">
){
    const session = await auth();
    if(!session?.user){
        return Response.json ({error: "No autenticado"}, {status:401});
    }

    const {id} = await ctx.params;
    const body = await request.json();
    const parsed = updateReadingSchema.safeParse(body)
    if(!parsed.success){
        return Response.json({error: parsed.error.flatten()}, {status: 401});
    }

    const result = await prisma.reading.updateMany({
        where:{
            id,
            userId: session.user.id
        },
        data: parsed.data,
    });

    if (result.count === 0){
        return Response.json ({error: "Libro no encontrado"}, {status:401});
    }

    return Response.json({succes:true})

}