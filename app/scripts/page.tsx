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
import { WAREHOUSES } from '@/lib/constants';
import { ScriptList } from '@/components/script-list';
import type { Warehouse } from '@/lib/types';

export default function ScriptsPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | ''>('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Script Management</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {selectedWarehouse && <ScriptList warehouse={selectedWarehouse} />}
    </div>
  );
}