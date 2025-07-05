"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function createCheckoutSession(credits: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const pricePerCreditInPaise = 200; // ₹2.00 per credit

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${credits} Repo Credits`,
          },
          unit_amount: credits * pricePerCreditInPaise,
        },
        quantity: 1,
      },
    ],
    customer_creation: "always",
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/create?success=false`,
    client_reference_id: userId.toString(),
    metadata: {
      credits: credits.toString(),
    },
  });

  return redirect(session.url!);
}
