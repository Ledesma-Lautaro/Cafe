import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPurchase } from "@/lib/actions/purchase";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  const [users, products] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, name: true } }),
    prisma.product.findMany({ select: { id: true, name: true, price: true } }),
  ]);

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <form action={createPurchase} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="userId">Usuario</label>
          <select id="userId" name="userId" required className="rounded border px-3 py-2">
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="productId">Producto</label>
          <select id="productId" name="productId" required className="rounded border px-3 py-2">
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (${product.price.toString()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date">Fecha</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="rounded border px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Cargar compra
        </button>
      </form>
    </div>
  );
}