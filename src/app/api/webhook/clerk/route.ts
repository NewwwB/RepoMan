import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Received webhook: ${eventType}, user ID: ${id}`);

    if (eventType === "user.deleted") {
      console.log("Deleting user from DB...");
      await db.user.delete({
        where: { id },
      });
      return new Response("User deleted", { status: 200 });
    }

    const user = await (await clerkClient()).users.getUser(id!);
    console.log("Fetched Clerk user:", user);

    const dbUser = await db.user.findUnique({ where: { id } });

    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = {
        emailAddress: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl,
      };

      if (!dbUser) {
        console.log("Creating user in DB...");
        const newUser = await db.user.create({
          data: {
            id,
            ...userData,
          },
        });
        const projectId = "ecd0e90d-a070-4e33-94a0-940f76039e1c";
        await db.userToProject.create({
          data: {
            userId: newUser.id,
            projectId: projectId,
          },
        });
      } else {
        console.log("Updating user in DB...");
        await db.user.update({
          where: { id },
          data: userData,
        });
      }

      return new Response("User created/updated", { status: 200 });
    }

    return new Response("Unhandled event type", { status: 400 });
  } catch (err: any) {
    console.error("Error handling webhook:", err.message, err);
    return new Response("Webhook processing failed", { status: 400 });
  }
}
