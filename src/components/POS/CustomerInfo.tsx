"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";

export default function CustomerInfo({
  customerId,
  setCustomerId,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
}: {
  customerId: number;
  setCustomerId: (id: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string; phone: string; address: string }[]
  >([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/get-party`,
        { method: "POST", tokenType: "jwt", data: { type: "CUSTOMER" } }
      );

      setCustomers(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  // Handle name typing
  const handleNameChange = (value: string) => {
    setCustomerName(value);
    if (value.length > 0) {
      const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle phone typing
  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    if (value.length > 0) {
      const filtered = customers.filter((c) => c.phone.includes(value));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // When selecting suggestion
  const selectCustomer = (customer: {
    id: number;
    name: string;
    phone: string;
    address: string;
  }) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address);
    setSuggestions([]); // close dropdown
  };
  return (
    <div className="bg-bw-50 px-4 pb-4 rounded-md shadow-md ">
      <h2 className="text-bw-900 font-bold mb-2">
        Customer {loading && "Data Loading..."}
      </h2>

      <div className="flex w-full gap-2">
        <div className="flex-1 space-7-1 relative">
          <p className="hidden">{customerId}</p>
          <Label htmlFor="customer-name">Name</Label>
          <Input
            id="customer-name"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          {/* Suggestion Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-bw-200 rounded-md shadow-md z-50">
              {suggestions.map((c) => (
                <li
                  key={c.id}
                  className="px-3 py-2 hover:bg-bw-100 cursor-pointer"
                  onClick={() => selectCustomer(c)}
                >
                  {c.name} ({c.phone})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-ful">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
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
