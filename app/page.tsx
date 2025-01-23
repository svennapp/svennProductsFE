"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScriptList } from '@/components/script-list';
import { useWarehouses } from '@/hooks/use-warehouses';
import type { WarehouseId } from '@/lib/types';

export default function HomePage() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<WarehouseId | ''>('');
  const { warehouses, isLoading, error } = useWarehouses();
  const { toast } = useToast();

  // Show error toast if warehouse fetch fails
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="max-w-xs">
            <Select
              value={selectedWarehouseId.toString()}
              onValueChange={(value) => setSelectedWarehouseId(Number(value))}
              disabled={isLoading}
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
            {selectedWarehouse?.description && (
              <p className="mt-2 text-sm text-gray-500">
                {selectedWarehouse.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      {selectedWarehouse && <ScriptList warehouseId={selectedWarehouse.id} />}
    </div>
  );
}