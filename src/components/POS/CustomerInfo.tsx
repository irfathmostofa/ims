"use client";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { debounce } from "lodash";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
};

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
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/get-party`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { type: "CUSTOMER", limit: 100 },
        }
      );

      const formattedCustomers = (data.data || []).map((customer: any) => ({
        id: customer.id,
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      }));

      setCustomers(formattedCustomers);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string, searchBy: "name" | "phone") => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      const filtered = customers.filter((customer) => {
        const field = searchBy === "name" ? customer.name : customer.phone;
        return field?.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    }, 300),
    [customers]
  );

  const handleNameChange = (value: string) => {
    setCustomerName(value);
    if (value.trim()) {
      debouncedSearch(value, "name");
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    if (value.trim()) {
      debouncedSearch(value, "phone");
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearCustomer = () => {
    setCustomerId(0);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-bw-900 font-bold text-lg">Customer Information</h2>
        {customerId > 0 && (
          <button
            onClick={clearCustomer}
            className="text-xs bg-bw-200 text-bw-700 px-2 py-1 rounded hover:bg-bw-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex  gap-4">
        {/* Name Field with Suggestions */}
        <div className="relative">
          <Label htmlFor="customer-name" className="mb-1 block">
            Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="customer-name"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="pr-8"
              required
            />
            {customerName && (
              <button
                onClick={() => handleNameChange("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-bw-400 hover:text-bw-600"
              >
                ✕
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-bw-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((customer) => (
                <div
                  key={customer.id}
                  className="px-3 py-2 hover:bg-bw-50 cursor-pointer border-b border-bw-100 last:border-b-0"
                  onClick={() => selectCustomer(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-xs text-bw-500">{customer.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <Label htmlFor="customer-phone" className="mb-1 block">
            Phone
          </Label>
          <Input
            id="customer-phone"
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
        </div>

        {/* Address Field */}
        <div className="flex-1">
          <Label htmlFor="customer-address" className="mb-1 block">
            Address
          </Label>
          <Input
            id="customer-address"
            placeholder="Customer address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <p className="text-sm text-bw-500 mt-2">Loading customer data...</p>
      )}
    </div>
  );
}
