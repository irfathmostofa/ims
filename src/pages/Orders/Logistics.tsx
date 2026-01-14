import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  RefreshCw,
  Package2,
  Package,
  Store,
  Calculator,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreasTab } from "@/components/logistics/AreasTab";
import { PickupStoresTab } from "@/components/logistics/PickupStoresTab";
import { CalculatorTab } from "@/components/logistics/CalculatorTab";
import { TrackingTab } from "@/components/logistics/TrackingTab";
import { CreateParcelTab } from "@/components/logistics/CreateParcelTab";
import { CreateStoreTab } from "@/components/logistics/CreateStoreTab";

export const Logistics = () => {
  const [activeTab, setActiveTab] = useState<string>("areas");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-7 w-7 text-[#003333]" />
            RedX Logistics Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Seamless parcel management and delivery operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Package2 size={12} />0 Items
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
            disabled={loading}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 w-full  bg-white">
          <TabsTrigger
            value="areas"
            className="flex items-center gap-2 min-w-fit"
          >
            <MapPin size={16} />
            Areas
          </TabsTrigger>
          <TabsTrigger
            value="stores"
            className="flex items-center gap-2 min-w-fit"
          >
            <Store size={16} />
            Pickup Stores
          </TabsTrigger>
          <TabsTrigger
            value="calculator"
            className="flex items-center gap-2 min-w-fit"
          >
            <Calculator size={16} />
            Calculator
          </TabsTrigger>
          <TabsTrigger
            value="tracking"
            className="flex items-center gap-2 min-w-fit"
          >
            <Truck size={16} />
            Track Parcel
          </TabsTrigger>
          <TabsTrigger
            value="create-parcel"
            className="flex items-center gap-2 min-w-fit"
          >
            <Package size={16} />
            Create Parcel
          </TabsTrigger>
          <TabsTrigger
            value="create-store"
            className="flex items-center gap-2 min-w-fit"
          >
            <Store size={16} />
            Create Store
          </TabsTrigger>
        </TabsList>

        <TabsContent value="areas">
          <AreasTab />
        </TabsContent>

        <TabsContent value="stores">
          <PickupStoresTab />
        </TabsContent>

        <TabsContent value="calculator">
          <CalculatorTab />
        </TabsContent>

        <TabsContent value="tracking">
          <TrackingTab />
        </TabsContent>

        <TabsContent value="create-parcel">
          <CreateParcelTab />
        </TabsContent>

        <TabsContent value="create-store">
          <CreateStoreTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
