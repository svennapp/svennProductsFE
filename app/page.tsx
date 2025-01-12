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
import { WAREHOUSES } from '@/lib/constants';
import { ScriptList } from '@/components/script-list';
import type { Warehouse } from '@/lib/types';

export default function HomePage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | ''>('');

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="max-w-xs">
            <Select
              value={selectedWarehouse}
              onValueChange={(value) => setSelectedWarehouse(value as Warehouse)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSES.map((warehouse) => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse.charAt(0).toUpperCase() + warehouse.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selectedWarehouse && <ScriptList warehouse={selectedWarehouse} />}
    </div>
  );
}