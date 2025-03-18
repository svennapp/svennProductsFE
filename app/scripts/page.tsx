"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScriptList } from '@/components/script-list';
import { useWarehouses } from '@/hooks/use-warehouses';
import type { WarehouseResponse } from '@/lib/types';
import { ContentLayout } from '@/components/admin-panel/content-layout';

export default function ScriptsPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const { warehouses, isLoading, error } = useWarehouses();

  return (
    <ContentLayout title="Spider Scripts">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Script Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select
                value={selectedWarehouse?.toString() || ''}
                onValueChange={(value) => setSelectedWarehouse(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading warehouses..." : "Select a warehouse"} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedWarehouse && <ScriptList warehouseId={selectedWarehouse} />}
      </div>
    </ContentLayout>
  );
}