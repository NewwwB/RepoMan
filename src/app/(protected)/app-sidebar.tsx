"use client";

import {
  Bot,
  CreditCard,
  LayoutDashboardIcon,
  Plus,
  Presentation,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { title } from "process";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";

const applicationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

const AppSideProvider = () => {
  const { projects, projectId, setProjectId } = useProject();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null; // Skip rendering until client is ready

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl font-bold text-black/80">RepoMan</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn({
                        "bg-primary text-white": pathname === item.url,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((item, index) => (
                <SidebarMenuItem key={`${item.name}-${index}`}>
                  <SidebarMenuButton asChild>
                    <div
                      onClick={() => {
                        setProjectId(item.id);
                      }}
                    >
                      <div
                        className={cn(
                          "item-center text-primary flex size-6 justify-center rounded-sm border bg-white text-sm",
                          {
                            "bg-primary text-white": item.id === projectId,
                          },
                        )}
                      >
                        {item.name[0]}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              <SidebarMenuItem>
                <Link href="/create">
                  <Button size="sm" variant="outline" className="w-fit">
                    <Plus />
                    Add Project
                  </Button>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideProvider;
