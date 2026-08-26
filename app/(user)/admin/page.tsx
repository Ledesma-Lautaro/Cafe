import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPurchase } from "@/lib/actions/purchase";
import { SelectField, TextField } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export const metadata = { title: "Administración" };

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
    <div className="flex flex-col gap-6">
      <h1 className="text-title">Panel de administración</h1>

      <Alert tone="info">
        El punto de venta está simulado: las compras se cargan a mano desde acá.
        Cada carga suma puntos y puede desbloquear logros.
      </Alert>

      <Card tone="muted">
        <form action={createPurchase} className="flex flex-col gap-4">
          <SelectField id="userId" name="userId" label="Usuario" required>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </SelectField>

          <SelectField id="productId" name="productId" label="Producto" required>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (${product.price.toString()})
              </option>
            ))}
          </SelectField>

          <TextField
            id="date"
            name="date"
            label="Fecha"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
            defaultValue={new Date().toISOString().split("T")[0]}
          />

          <SubmitButton pendingLabel="Cargando…" className="self-start">
            Cargar compra
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}