"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerInfo({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
}: {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
}) {
  return (
    <div className="bg-bw-50 p-4 rounded-md shadow-md ">
      <h2 className="text-bw-900 font-bold mb-2">Customer Info</h2>
      <div className="flex w-full gap-2">
        <div className="flex-1 space-7-1">
          <Label htmlFor="customer-name">Name</Label>
          <Input
            id="customer-name"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="w-ful">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="w-ful">
          <Label htmlFor="customer-address">Address</Label>
          <Input
            id="customer-address"
            placeholder="Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
