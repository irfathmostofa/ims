import  { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { redxApi } from "@/hook/RedXApi";
import type { Area, CreateStoreData } from "@/types/redx";

export const CreateStoreTab = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [postalCode, setPostalCode] = useState<string>("");
  const [areasLoading, setAreasLoading] = useState<boolean>(false);

  const [storeForm, setStoreForm] = useState<CreateStoreData>({
    name: "",
    phone: "",
    address: "",
    area_id: 0,
  });

  const loadAreasByPostalCode = async () => {
    if (!postalCode.trim()) {
      toast.error("Please enter a postal code");
      return;
    }

    setAreasLoading(true);
    try {
      const postCode = parseInt(postalCode);
      const response = await redxApi.getAreasByPostCode(postCode);
      setAreas(response.areas || []);
      if (response.areas?.length === 0) {
        toast.info("No areas found for this postal code");
      }
    } catch (error: any) {
      console.error("Failed to load areas:", error);
      toast.error(error.message || "Failed to load areas");
    } finally {
      setAreasLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (
      !storeForm.name ||
      !storeForm.phone ||
      !storeForm.address ||
      !storeForm.area_id
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await redxApi.createPickupStore(storeForm);
      toast.success(`Store created successfully! ID: ${result.id}`);

      // Reset form
      setStoreForm({
        name: "",
        phone: "",
        address: "",
        area_id: 0,
      });
      setPostalCode("");
      setAreas([]);
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast.error(error.message || "Failed to create pickup store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store size={20} />
            Create New Pickup Store
          </CardTitle>
          <CardDescription>
            Add a new pickup store location for parcel collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name *</Label>
                <Input
                  id="store_name"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Store name"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_phone">Phone Number *</Label>
                <Input
                  id="store_phone"
                  value={storeForm.phone}
                  onChange={(e) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="01XXXXXXXXX"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_address">Address *</Label>
              <Textarea
                id="store_address"
                value={storeForm.address}
                onChange={(e) =>
                  setStoreForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Full store address"
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Area Search */}
            <div className="space-y-2">
              <Label>Search Area by Postal Code *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter postal code (e.g., 1206)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  type="number"
                  className="bg-white"
                />
                <Button
                  onClick={loadAreasByPostalCode}
                  disabled={areasLoading}
                  className="bg-[#003333] hover:bg-[#002222] text-white"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_area">Area *</Label>
              <Select
                value={storeForm.area_id.toString()}
                onValueChange={(value) =>
                  setStoreForm((prev) => ({
                    ...prev,
                    area_id: parseInt(value),
                  }))
                }
                disabled={areas.length === 0}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {areas.map((area) => (
                    <SelectItem
                      key={area.id}
                      value={area.id.toString()}
                      className="bg-white hover:bg-gray-100"
                    >
                      {area.name} ({area.post_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {areas.length === 0 && (
                <p className="text-xs text-gray-500">
                  Search for areas by postal code first
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setStoreForm({
                    name: "",
                    phone: "",
                    address: "",
                    area_id: 0,
                  });
                  setPostalCode("");
                  setAreas([]);
                }}
                className="bg-white"
              >
                Clear Form
              </Button>
              <Button
                onClick={handleCreateStore}
                disabled={
                  loading ||
                  !storeForm.name ||
                  !storeForm.phone ||
                  !storeForm.address ||
                  !storeForm.area_id
                }
                className="bg-[#003333] hover:bg-[#002222] text-white"
              >
                {loading ? "Creating Store..." : "Create Store"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
