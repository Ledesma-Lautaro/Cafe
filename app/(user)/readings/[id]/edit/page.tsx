import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EditReadingForm } from "@/components/reading/EditReadingForm";

export default async function EditReadingPage(
  props: PageProps<"/readings/[id]/edit">,
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await props.params;
  const reading = await prisma.reading.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!reading) notFound();

  return <EditReadingForm reading={reading} />;
}
