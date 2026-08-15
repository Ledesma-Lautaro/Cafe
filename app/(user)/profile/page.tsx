import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-bold">Tu perfil</h1>
      <p className="mt-4 text-sm text-gray-500">
        Miembro desde {user.createdAt.toLocaleDateString("es-AR")}
      </p>
      <ProfileForm initialName={user.name} email={user.email} />
            <h2 className="mt-10 text-xl font-bold">Historial de compras</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {purchases.map((purchase) => (
          <li key={purchase.id} className="rounded border p-3">
            <p className="font-semibold">{purchase.product.name}</p>
            <p className="text-sm text-gray-500">
              {purchase.date.toLocaleDateString("es-AR")} — $
              {purchase.amount.toString()}
            </p>
          </li>
        ))}
      </ul>

      {purchases.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Todavía no tenés compras registradas.
        </p>
      )}
    </div>
  );
}
