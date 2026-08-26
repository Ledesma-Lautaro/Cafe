import { ImageResponse } from "next/og";

export const alt = "SOLAPA — leé, sumá puntos y descubrí tu próximo libro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#FDF6EC",
          color: "#16130F",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "8px 20px",
            marginBottom: 32,
            background: "#FFC93C",
            border: "4px solid #16130F",
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
         SOLAPA
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          Leé, sumá puntos y descubrí tu próximo libro
        </div>
        <div style={{ marginTop: 32, fontSize: 32, color: "#5B5347" }}>
          Recomendador por embeddings · 5,8× mejor que el azar
        </div>
      </div>
    ),
    size,
  );
}