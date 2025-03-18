"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function SettingsPage() {
  return (
    <ContentLayout title="Settings">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings page coming soon.</p>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}