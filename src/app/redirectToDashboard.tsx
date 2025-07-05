"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return null; // No UI
}
