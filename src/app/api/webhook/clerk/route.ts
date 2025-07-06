import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );
    console.log("Webhook payload:", evt.data);

    const client = await clerkClient();
    const user = await client.users.getUser(id!);

    const dbUser = await db.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!dbUser) {
      await db.user.create({
        data: {
          emailAddress: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl,
        },
      });
    } else {
      await db.user.update({
        where: {
          id: id,
        },
        data: {
          emailAddress: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl,
        },
      });
    }
    if (eventType === "user.deleted") {
      await db.user.delete({
        where: {
          id: id,
        },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
