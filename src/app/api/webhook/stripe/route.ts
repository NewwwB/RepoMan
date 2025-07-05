//api/webhook/stripe

import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import stripe from "stripe";
import { db } from "~/server/db";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (e) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log("----------------------------------------------");
  console.log(`Event Type : ${event.type}`);
  console.log("----------------------------------------------");

  if (event.type === "checkout.session.completed") {
    const credits = Number(session.metadata?.["credits"]);
    const userId = session.client_reference_id;
    if (!userId || !credits) {
      return NextResponse.json(
        { error: "Missing userId or credits" },
        { status: 400 },
      );
    }

    await db.stripeTransactions.create({ data: { userId, credits } });
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
    return NextResponse.json(
      { message: "Credits added successfully" },
      { status: 200 },
    );
  }

  return NextResponse.json({ message: `event type: ${event.type}` });
}
