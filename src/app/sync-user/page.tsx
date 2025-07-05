// app/sync/page.tsx
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function SyncPage() {
  const user = await currentUser();

  const userId = user?.id;
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email) {
    redirect("/sign-in");
  }

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    await db.user.upsert({
      where: { emailAddress: email },
      update: {
        imageUrl: user.imageUrl,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
      create: {
        id: userId,
        emailAddress: email,
        imageUrl: user.imageUrl,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
    });
  }

  redirect("/dashboard");
}
