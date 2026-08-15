import type { Prisma } from "@/app/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export const POINTS_PER_READING = 10;
export const POINTS_PER_CURRENCY_UNIT = 100;

export function pointsForPurchase(amount : number) : number{
    return Math.floor(amount / POINTS_PER_CURRENCY_UNIT);
}

export async function awardReadingPoints(
    tx: TransactionClient,
    userId: string,
    readingId: string,
){
    await tx.pointsLedger.create({
        data : {userId, sourceType: "READING", readingId, points : POINTS_PER_READING},
    });
}

export async function awardPurchasePoints(
    tx: TransactionClient,
    userId: string,
    purchaseId: string,
    amount: number,
){
    const points = pointsForPurchase (amount);
    if(points > 0) {
        await tx.pointsLedger.create ({
            data : {
                userId, sourceType :"PURCHASE", purchaseId, points
            },
        });
    }

}