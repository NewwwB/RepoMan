// app/(protected)/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import AppSideProvider from "./app-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* sidebar */}
      <AppSideProvider />
      <main className="h-screen w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
