"use client";

import { ReactNode, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout';

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status } = useSession();
  // Use client-side only rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Check authentication status
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);
  
  if (!isClient) {
    return <div className="min-h-screen bg-background" suppressHydrationWarning />;
  }

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
