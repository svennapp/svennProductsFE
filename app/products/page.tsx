"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Product management coming soon.</p>
      </CardContent>
    </Card>
  );
}