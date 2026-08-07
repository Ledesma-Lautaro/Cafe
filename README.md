# Cafetería/Biblioteca

Web para una cafetería/pastelería que funciona también como biblioteca: cada
usuario tiene un perfil donde registra sus lecturas, acumula puntos y
desbloquea logros con recompensas.

Proyecto de portfolio, desarrollado en solitario y por sprints. El sistema de
negocio real (POS, facturación fiscal, medios de pago) queda fuera de alcance
y se simula con datos mock — el foco está puesto en la plataforma de usuarios
(lecturas, logros, recomendador con IA).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS 4
- Prisma 7 + [Neon](https://neon.tech) (Postgres serverless)

## Estructura del proyecto
app/
(auth)/ # login, registro
(user)/ # perfil: lecturas, compras, logros
admin/ # panel restringido a rol ADMIN (carga de compras simuladas)
api/ # endpoints reales

components/
ui/ # componentes genéricos, sin lógica de negocio
<feature>/ # componentes específicos de un dominio

lib/
prisma.ts # cliente de Prisma (singleton + adapter de Neon)
auth/ # hashing, sesión
points/ # reglas de conversión y evaluación de logros
ai/ # capa del recomendador de lecturas

types/ # tipos que no vienen generados por Prisma
prisma/ # schema, migraciones, seed                    


## Correrlo localmente

1. `npm install`
2. Crear `.env.local` con las credenciales de tu proyecto de Neon:
DATABASE_URL="postgresql://...pooler.../neondb?..."
DATABASE_URL_UNPOOLED="postgresql://.../neondb?..."
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev` — abre [http://localhost:3000](http://localhost:3000)

## Alcance y decisiones

El proyecto recorta deliberadamente el sistema de negocio real (ver sección
"Fuera de alcance" del spec original) para poder completarse en solitario
como pieza de portfolio.
