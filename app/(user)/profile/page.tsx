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

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-bold">Tu perfil</h1>
      <p className="mt-4 text-sm text-gray-500">
        Miembro desde {user.createdAt.toLocaleDateString("es-AR")}
      </p>
      <ProfileForm initialName={user.name} email={user.email} />
    </div>
  );
}