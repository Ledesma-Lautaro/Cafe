import { auth } from "@/auth";
import { getRecommendations } from "@/lib/recommendations";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const result = await getRecommendations(session.user.id);
  return Response.json(result);
}