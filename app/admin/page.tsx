import {redirect} from "next/navigation";
import {auth} from "@/auth";

export default async function AdminPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/profile");
    }
    return(
        <div className="mx-auto max-w-sm py-16">
            <h1 className="text-2xl font-bold">
                Bienvenido al panel de administración
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                La carga de compras simuladas se agrega en el Sprint 3
            </p>
        </div>
    )
}