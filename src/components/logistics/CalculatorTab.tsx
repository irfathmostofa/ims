import  { useState, useEffect } from "react";
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
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { redxApi } from "@/hook/RedXApi";
import type {
  Area,
  PickupStore,
  ChargeParams,
  ChargeResponse,
} from "@/types/redx";

export const CalculatorTab = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [pickupStores, setPickupStores] = useState<PickupStore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chargeParams, setChargeParams] = useState<ChargeParams>({
    delivery_area_id: 0,
    pickup_area_id: 0,
    cash_collection_amount: 0,
    weight: 500,
  });
  const [chargeResult, setChargeResult] = useState<ChargeResponse | null>(null);
  const [postalCode, setPostalCode] = useState<string>("");

  const loadAreasByPostalCode = async () => {
    if (!postalCode.trim()) {
      toast.error("Please enter a postal code");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };
  const loadPickupStores = async () => {
    setLoading(true);
    try {
      const response = await redxApi.getPickupStores();
      setPickupStores(response.pickup_stores || []);
      toast.success("Pickup stores loaded successfully");
    } catch (error: any) {
      console.error("Failed to load pickup stores:", error);
      toast.error(error.message || "Failed to load pickup stores");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPickupStores();
  }, []);
  const handleCalculateCharge = async () => {
    if (!chargeParams.delivery_area_id || !chargeParams.pickup_area_id) {
      toast.error("Please select both pickup and delivery areas");
      return;
    }

    if (chargeParams.weight <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    setLoading(true);
    try {
      const result = await redxApi.calculateCharge(chargeParams);
      setChargeResult(result);
      toast.success("Charges calculated successfully");
    } catch (error: any) {
      console.error("Failed to calculate charges:", error);
      toast.error(error.message || "Failed to calculate charges");
      setChargeResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Delivery Charge Calculator
          </CardTitle>
          <CardDescription>
            Calculate delivery charges based on area, weight, and COD amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Postal Code Search */}
              <div className="space-y-2">
                <Label>Search Areas by Postal Code</Label>
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
                    disabled={loading}
                    className="bg-[#003333] hover:bg-[#002222] text-white"
                  >
                    Search
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Search for areas to select pickup and delivery locations
                </p>
              </div>

              {/* Pickup Area */}
              <div className="space-y-2">
                <Label htmlFor="pickup_area">Pickup Area</Label>
                <Select
                  value={chargeParams.pickup_area_id.toString()}
                  onValueChange={(value) =>
                    setChargeParams((prev) => ({
                      ...prev,
                      pickup_area_id: parseInt(value),
                    }))
                  }
                  disabled={pickupStores.length === 0 || loading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select pickup area" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {pickupStores.map((store) => (
                      <SelectItem
                        key={`pickup-${store.id}`}
                        value={store.area_id.toString()}
                        className="bg-white hover:bg-gray-100"
                      >
                        {store.name} ({store.area_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Area */}
              <div className="space-y-2">
                <Label htmlFor="delivery_area">Delivery Area</Label>
                <Select
                  value={chargeParams.delivery_area_id.toString()}
                  onValueChange={(value) =>
                    setChargeParams((prev) => ({
                      ...prev,
                      delivery_area_id: parseInt(value),
                    }))
                  }
                  disabled={areas.length === 0 || loading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select delivery area" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {areas.map((area) => (
                      <SelectItem
                        key={`delivery-${area.id}`}
                        value={area.id.toString()}
                        className="bg-white hover:bg-gray-100"
                      >
                        {area.name} ({area.post_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <Label htmlFor="weight">Parcel Weight (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={chargeParams.weight}
                  onChange={(e) =>
                    setChargeParams((prev) => ({
                      ...prev,
                      weight: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Weight in grams"
                  className="bg-white"
                  min="1"
                />
              </div>

              {/* COD Amount */}
              <div className="space-y-2">
                <Label htmlFor="cod_amount">COD Amount (BDT)</Label>
                <Input
                  id="cod_amount"
                  type="number"
                  value={chargeParams.cash_collection_amount}
                  onChange={(e) =>
                    setChargeParams((prev) => ({
                      ...prev,
                      cash_collection_amount: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Cash collection amount"
                  className="bg-white"
                  min="0"
                />
              </div>

              {/* Calculate Button */}
              <Button
                onClick={handleCalculateCharge}
                disabled={
                  loading ||
                  !chargeParams.pickup_area_id ||
                  !chargeParams.delivery_area_id ||
                  chargeParams.weight <= 0
                }
                className="w-full bg-[#003333] hover:bg-[#002222] text-white"
              >
                {loading ? "Calculating..." : "Calculate Charges"}
              </Button>
            </div>

            {/* Results Panel */}
            <div>
              {chargeResult ? (
                <Card className="bg-gray-50">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4">Charge Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">Delivery Charge</p>
                          <p className="text-sm text-gray-600">
                            Basic delivery cost
                          </p>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                          ৳{chargeResult.deliveryCharge}
                        </p>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">COD Charge</p>
                          <p className="text-sm text-gray-600">
                            Cash on delivery fee
                          </p>
                        </div>
                        <p className="text-xl font-bold text-purple-600">
                          ৳{chargeResult.codCharge}
                        </p>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="font-bold">Total Charge</p>
                          <p className="text-sm text-green-700">
                            Amount to be paid
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          ৳
                          {chargeResult.deliveryCharge + chargeResult.codCharge}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This is an estimated charge.
                        Actual charges may vary based on specific requirements
                        and additional services.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calculator className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-center">
                      Fill in the details and calculate charges
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Select pickup and delivery areas, then click Calculate
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
