"use client";

import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout';
import { useEffect, useState } from 'react';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use client-side only rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="min-h-screen bg-background" suppressHydrationWarning />;
  }
  
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
