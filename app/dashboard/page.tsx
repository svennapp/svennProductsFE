"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
import { ContentLayout } from '@/components/admin-panel/content-layout';

export default function Page() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<WarehouseId | ''>('');
  const { warehouses, isLoading, error } = useWarehouses();
  const { toast } = useToast();

  // Load selected warehouse from localStorage on mount
  useEffect(() => {
    const savedWarehouse = localStorage.getItem('selectedWarehouse');
    if (savedWarehouse) {
      setSelectedWarehouseId(Number(savedWarehouse));
    }
  }, []);

  // Save selected warehouse to localStorage when it changes
  useEffect(() => {
    if (selectedWarehouseId) {
      localStorage.setItem('selectedWarehouse', selectedWarehouseId.toString());
    }
  }, [selectedWarehouseId]);

  // Show error toast if warehouse fetch fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="max-w-xs">
              <Select
                value={selectedWarehouseId ? selectedWarehouseId.toString() : ''}
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
    </ContentLayout>
  );
}
