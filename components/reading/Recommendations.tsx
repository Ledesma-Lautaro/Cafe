import { getRecommendations } from "@/lib/recommendations";

export async function Recommendations({ userId }: { userId: string }) {
  const { recommendations, coldStart } = await getRecommendations(userId);

  if (recommendations.length === 0) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        Cargá algunas lecturas para recibir recomendaciones.
      </p>
    );
  }

  return (
    <>
      {coldStart && (
        <p className="mt-2 text-sm text-gray-500">
          Todavía no registraste lecturas, así que te mostramos lo más leído.
        </p>
      )}
      <ul className="mt-4 flex flex-col gap-3">
        {recommendations.map((rec) => (
          <li key={rec.id} className="rounded border p-3">
            <p className="font-semibold">{rec.title}</p>
            <p className="text-sm text-gray-500">{rec.author}</p>
            <p className="mt-1 text-sm text-gray-400">{rec.reason}</p>
          </li>
        ))}
      </ul>
    </>
  );
}