import { Sparkles, Lightbulb } from "lucide-react";
import { getRecommendations } from "@/lib/recommendations";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export async function Recommendations({ userId }: { userId: string }) {
  const { recommendations, coldStart } = await getRecommendations(userId);

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Sin recomendaciones todavía"
        description="Registrá algunas lecturas y el recomendador va a empezar a sugerirte libros."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {coldStart && (
        <Card tone="sky" className="text-sm">
          Todavía no registraste lecturas, así que te mostramos{" "}
          <strong>lo más leído del catálogo</strong>. En cuanto cargues la primera,
          las recomendaciones pasan a basarse en tus gustos.
        </Card>
      )}

      <ol className="flex flex-col gap-4">
        {recommendations.map((rec, index) => (
          <Card as="li" key={rec.id} tone="brand" className="flex gap-4">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand font-display text-on-accent"
            >
              {index + 1}
            </span>
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="text-heading">{rec.title}</h3>
                <p className="text-sm text-ink-soft">{rec.author}</p>
              </div>
              {rec.reason && (
                <p className="flex gap-2 text-sm">
                  <Lightbulb size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden />
                  <span>{rec.reason}</span>
                </p>
              )}
            </div>
          </Card>
        ))}
      </ol>
    </div>
  );
}