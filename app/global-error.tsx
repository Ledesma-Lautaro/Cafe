"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <title>Error — SOLAPA</title>
        <style>{`
          :root { color-scheme: light dark; }
          body {
            margin: 0; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, sans-serif;
            background: light-dark(#FDF6EC, #14110E);
            color: light-dark(#16130F, #F5EDE0);
          }
          .box {
            max-width: 28rem; margin: 1rem; padding: 2rem; text-align: center;
            border: 2px solid currentColor; border-radius: 0.75rem;
            background: light-dark(#FFE0DB, #3D211D);
          }
          .btn {
            margin-top: 1.5rem; padding: 0.625rem 1rem; cursor: pointer;
            font: inherit; font-weight: 700;
            border: 2px solid light-dark(#16130F, #F5EDE0); border-radius: 0.75rem;
            background: #FFC93C; color: #16130F;
          }
        `}</style>
        <div className="box">
          <h1>Algo salió mal</h1>
          <p>La aplicación no pudo iniciarse. Probá recargar en unos segundos.</p>
          {error.digest && <p style={{ fontSize: "0.75rem" }}>Código: {error.digest}</p>}
          <button className="btn" onClick={() => retry()}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}