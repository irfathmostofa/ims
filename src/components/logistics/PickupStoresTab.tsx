import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  RefreshCw,
  Home,
  MapPin,
  Phone,
  Calendar,
  Search,
  Copy,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { redxApi } from "@/hook/RedXApi";
import type { PickupStore } from "@/types/redx";

export const PickupStoresTab = () => {
  const [pickupStores, setPickupStores] = useState<PickupStore[]>([]);
  const [filteredStores, setFilteredStores] = useState<PickupStore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadPickupStores = async () => {
    setLoading(true);
    try {
      const response = await redxApi.getPickupStores();
      setPickupStores(response.pickup_stores || []);
      setFilteredStores(response.pickup_stores || []);
      toast.success("Pickup stores loaded successfully");
    } catch (error: any) {
      console.error("Failed to load pickup stores:", error);
      toast.error(error.message || "Failed to load pickup stores");
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStores(pickupStores);
    } else {
      const filtered = pickupStores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.area_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.phone.includes(searchQuery)
      );
      setFilteredStores(filtered);
    }
  }, [searchQuery, pickupStores]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  useEffect(() => {
    loadPickupStores();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store size={20} />
            Pickup Stores
          </CardTitle>
          <CardDescription>Manage all pickup store locations</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stores by name, address, area, or phone..."
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={loadPickupStores}
                disabled={loading}
                className="bg-[#003333] hover:bg-[#002222] text-white"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading stores...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-white">
              <Store className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">No pickup stores found</p>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-1">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map((store) => (
                <Card
                  key={store.id}
                  className="overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{store.name}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            ID: {store.id}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(`${store.name} - ${store.address}`)
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Home size={14} className="text-gray-500" />
                          <span className="line-clamp-2">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-gray-500" />
                          <span>{store.area_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-500" />
                          <span>{store.phone}</span>
                        </div>
                        {store.created_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>
                              Created:{" "}
                              {new Date(store.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[#003333] text-[#003333] hover:bg-[#003333] hover:text-white"
                        onClick={() => {
                          // Navigate to create parcel tab with this store selected
                          window.dispatchEvent(
                            new CustomEvent("set-pickup-store", {
                              detail: store.id,
                            })
                          );
                        }}
                      >
                        <Package size={14} className="mr-2" />
                        Use for Parcel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredStores.length} of {pickupStores.length} stores
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
