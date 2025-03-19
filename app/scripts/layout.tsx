"use client";

import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout';

export default function ScriptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
