import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Calculator,
  Package,
  Store,
  Truck,
  RefreshCw,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Home,
  Navigation,
  Phone,
  Calendar,
  Filter,
} from "lucide-react";
import type {
  Area,
  CreateParcelData,
  CreateStoreData,
  PickupStore,
  ChargeParams,
  ChargeResponse,
} from "@/types/redx";
import { redxApi } from "@/hook/RedXApi";

export const Logistics = () => {
  const [activeTab, setActiveTab] = useState<string>("areas");
  const [loading, setLoading] = useState<boolean>(false);

  // States for different tabs
  const [areas, setAreas] = useState<Area[]>([]);
  const [pickupStores, setPickupStores] = useState<PickupStore[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Charge calculator states
  const [chargeParams, setChargeParams] = useState<ChargeParams>({
    delivery_area_id: 0,
    pickup_area_id: 0,
    cash_collection_amount: 0,
    weight: 500,
  });
  const [chargeResult, setChargeResult] = useState<ChargeResponse | null>(null);

  // Parcel tracking
  const [trackingId, setTrackingId] = useState<string>("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [parcelInfo, setParcelInfo] = useState<any>(null);

  // Create store form
  const [storeForm, setStoreForm] = useState<CreateStoreData>({
    name: "",
    phone: "",
    address: "",
    area_id: 0,
  });

  // Create parcel form
  const [parcelForm, setParcelForm] = useState<CreateParcelData>({
    customer_name: "",
    customer_phone: "",
    delivery_area: "",
    delivery_area_id: 0,
    customer_address: "",
    cash_collection_amount: "0",
    parcel_weight: 500,
    merchant_invoice_id: "",
    instruction: "",
    value: "0",
    is_closed_box: "false",
    pickup_store_id: undefined,
    parcel_details_json: [],
  });

  // Load initial data
  useEffect(() => {
    if (activeTab === "areas") {
      loadAreas();
    } else if (activeTab === "stores") {
      loadPickupStores();
    }
  }, [activeTab]);

  // Filter areas based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAreas(areas);
    } else {
      const filtered = areas.filter(
        (area) =>
          area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          area.division_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [searchQuery, areas]);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const response = await redxApi.getAreas();
      setAreas(response.areas || []);
      setFilteredAreas(response.areas || []);
      toast.success("Areas loaded successfully");
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

  const handleCalculateCharge = async () => {
    if (!chargeParams.delivery_area_id || !chargeParams.pickup_area_id) {
      toast.error("Please select both pickup and delivery areas");
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
    } finally {
      setLoading(false);
    }
  };

  const handleTrackParcel = async () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    try {
      const [infoResponse, trackingResponse] = await Promise.all([
        redxApi.getParcelInfo(trackingId),
        redxApi.trackParcel(trackingId),
      ]);

      setParcelInfo(infoResponse.parcel);
      setTrackingData(trackingResponse.tracking);
      toast.success("Parcel information loaded");
    } catch (error: any) {
      console.error("Tracking failed:", error);
      toast.error(error.message || "Failed to track parcel");
      setParcelInfo(null);
      setTrackingData(null);
    } finally {
      setLoading(false);
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
      toast.success("Pickup store created successfully");

      // Reset form
      setStoreForm({
        name: "",
        phone: "",
        address: "",
        area_id: 0,
      });

      // Refresh stores list
      loadPickupStores();
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast.error(error.message || "Failed to create pickup store");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParcel = async () => {
    // Validate required fields
    if (
      !parcelForm.customer_name ||
      !parcelForm.customer_phone ||
      !parcelForm.delivery_area_id
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await redxApi.createParcel(parcelForm);
      toast.success(`Parcel created! Tracking ID: ${result.tracking_id}`);

      // Reset form
      setParcelForm({
        customer_name: "",
        customer_phone: "",
        delivery_area: "",
        delivery_area_id: 0,
        customer_address: "",
        cash_collection_amount: "0",
        parcel_weight: 500,
        merchant_invoice_id: "",
        instruction: "",
        value: "0",
        is_closed_box: "false",
        pickup_store_id: undefined,
        parcel_details_json: [],
      });
    } catch (error: any) {
      console.error("Failed to create parcel:", error);
      toast.error(error.message || "Failed to create parcel");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode }
    > = {
      "pickup-pending": {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={12} />,
      },
      "picked-up": {
        color: "bg-blue-100 text-blue-800",
        icon: <Truck size={12} />,
      },
      "in-transit": {
        color: "bg-purple-100 text-purple-800",
        icon: <Navigation size={12} />,
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={12} />,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={12} />,
      },
      returned: {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle size={12} />,
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: <AlertCircle size={12} />,
    };

    return (
      <div className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status.replace("-", " ").toUpperCase()}
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RedX Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage logistics, areas, pickup stores, and track parcels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "areas") loadAreas();
              else if (activeTab === "stores") loadPickupStores();
            }}
            disabled={loading}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 w-full max-w-4xl">
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin size={16} />
            Areas
          </TabsTrigger>
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Store size={16} />
            Pickup Stores
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator size={16} />
            Charge Calculator
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Truck size={16} />
            Track Parcel
          </TabsTrigger>
          <TabsTrigger
            value="create-parcel"
            className="flex items-center gap-2"
          >
            <Package size={16} />
            Create Parcel
          </TabsTrigger>
          <TabsTrigger value="create-store" className="flex items-center gap-2">
            <Store size={16} />
            Create Store
          </TabsTrigger>
          <TabsTrigger value="quick-tools" className="flex items-center gap-2">
            <AlertCircle size={16} />
            Quick Tools
          </TabsTrigger>
        </TabsList>

        {/* Areas Tab */}
        <TabsContent value="areas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Available Delivery Areas
              </CardTitle>
              <CardDescription>
                Browse and search through all available delivery areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search areas by name, division, or postal code..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        loadAreas();
                      }}
                    >
                      Clear
                    </Button>
                    <Button onClick={loadAreas} disabled={loading}>
                      {loading ? "Loading..." : "Refresh Areas"}
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading areas...</p>
                </div>
              ) : filteredAreas.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No areas found</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 mt-1">
                      Try a different search term or clear the search
                    </p>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Area Name</TableHead>
                          <TableHead>Postal Code</TableHead>
                          <TableHead>Division</TableHead>
                          <TableHead>Zone ID</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAreas.map((area) => (
                          <TableRow key={area.id}>
                            <TableCell className="font-medium">
                              {area.id}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{area.name}</div>
                              <div className="text-xs text-gray-500">
                                Area #{area.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="outline">{area.post_code}</div>
                            </TableCell>
                            <TableCell>{area.division_name}</TableCell>
                            <TableCell>
                              <div className="secondary">
                                Zone {area.zone_id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setChargeParams((prev) => ({
                                    ...prev,
                                    delivery_area_id: area.id,
                                    pickup_area_id: prev.pickup_area_id || 1,
                                  }));
                                  setActiveTab("calculator");
                                }}
                              >
                                <Calculator size={14} className="mr-1" />
                                Calculate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredAreas.length} of {areas.length} areas
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Areas
                    </p>
                    <p className="text-2xl font-bold">{areas.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Divisions
                    </p>
                    <p className="text-2xl font-bold">
                      {new Set(areas.map((a) => a.division_name)).size}
                    </p>
                  </div>
                  <Navigation className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Zones</p>
                    <p className="text-2xl font-bold">
                      {new Set(areas.map((a) => a.zone_id)).size}
                    </p>
                  </div>
                  <Filter className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">Just now</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pickup Stores Tab */}
        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store size={20} />
                Pickup Stores
              </CardTitle>
              <CardDescription>
                Manage all pickup store locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading stores...</p>
                </div>
              ) : pickupStores.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <Store className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No pickup stores found</p>
                  <Button
                    onClick={() => setActiveTab("create-store")}
                    className="mt-4"
                  >
                    Create Your First Store
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pickupStores.map((store) => (
                    <Card key={store.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {store.name}
                              </h3>
                              <div className="mt-1">ID: {store.id}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  `${store.name} - ${store.address}`
                                )
                              }
                            >
                              <Copy size={14} />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Home size={14} className="text-gray-500" />
                              <span>{store.address}</span>
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
                                  {new Date(
                                    store.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setParcelForm((prev) => ({
                                ...prev,
                                pickup_store_id: store.id,
                              }));
                              setActiveTab("create-parcel");
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charge Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pickup area" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name} ({area.post_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery area" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name} ({area.post_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                    />
                  </div>

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
                    />
                  </div>

                  <Button
                    onClick={handleCalculateCharge}
                    disabled={
                      loading ||
                      !chargeParams.pickup_area_id ||
                      !chargeParams.delivery_area_id
                    }
                    className="w-full"
                  >
                    {loading ? "Calculating..." : "Calculate Charges"}
                  </Button>
                </div>

                <div>
                  {chargeResult ? (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-lg mb-4">
                          Charge Breakdown
                        </h3>
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
                              {chargeResult.deliveryCharge +
                                chargeResult.codCharge}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> This is an estimated charge.
                            Actual charges may vary based on specific
                            requirements and additional services.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
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
        </TabsContent>

        {/* Track Parcel Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck size={20} />
                Track Parcel
              </CardTitle>
              <CardDescription>
                Enter tracking ID to get real-time parcel status and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter RedX Tracking ID (e.g., 21A427TU4BN3R)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <Button onClick={handleTrackParcel} disabled={loading}>
                    {loading ? "Tracking..." : "Track Parcel"}
                  </Button>
                </div>

                {parcelInfo && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">
                          Parcel Information
                        </h3>
                        <div className="outline">
                          {getStatusBadge(parcelInfo.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-gray-700">
                            Customer Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">
                                {parcelInfo.customer_name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">
                                {parcelInfo.customer_phone}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Address:</span>
                              <span className="font-medium text-right">
                                {parcelInfo.customer_address}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-gray-700">
                            Parcel Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Delivery Area:
                              </span>
                              <span className="font-medium">
                                {parcelInfo.delivery_area}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">
                                {parcelInfo.parcel_weight}g
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">COD Amount:</span>
                              <span className="font-medium text-green-600">
                                ৳{parcelInfo.cash_collection_amount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Delivery Charge:
                              </span>
                              <span className="font-medium">
                                ৳{parcelInfo.charge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {trackingData && trackingData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tracking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trackingData.map((update: any, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                              {index < trackingData.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-300 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {update.message_en}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {update.message_bn}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500 whitespace-nowrap">
                                  {new Date(update.time).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Parcel Tab */}
        <TabsContent value="create-parcel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Create New Parcel
              </CardTitle>
              <CardDescription>
                Fill in the details to create a new parcel for delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Customer Name *</Label>
                    <Input
                      id="customer_name"
                      value={parcelForm.customer_name}
                      onChange={(e) =>
                        setParcelForm((prev) => ({
                          ...prev,
                          customer_name: e.target.value,
                        }))
                      }
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Customer Phone *</Label>
                    <Input
                      id="customer_phone"
                      value={parcelForm.customer_phone}
                      onChange={(e) =>
                        setParcelForm((prev) => ({
                          ...prev,
                          customer_phone: e.target.value,
                        }))
                      }
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_address">Delivery Address *</Label>
                  <Textarea
                    id="customer_address"
                    value={parcelForm.customer_address}
                    onChange={(e) =>
                      setParcelForm((prev) => ({
                        ...prev,
                        customer_address: e.target.value,
                      }))
                    }
                    placeholder="Full delivery address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_area">Delivery Area *</Label>
                    <Select
                      value={parcelForm.delivery_area_id.toString()}
                      onValueChange={(value) => {
                        const area = areas.find(
                          (a) => a.id === parseInt(value)
                        );
                        setParcelForm((prev) => ({
                          ...prev,
                          delivery_area: area?.name || "",
                          delivery_area_id: parseInt(value),
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name} ({area.post_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parcel_weight">
                      Parcel Weight (grams) *
                    </Label>
                    <Input
                      id="parcel_weight"
                      type="number"
                      value={parcelForm.parcel_weight}
                      onChange={(e) =>
                        setParcelForm((prev) => ({
                          ...prev,
                          parcel_weight: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="Weight in grams"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cash_collection_amount">
                      COD Amount (BDT)
                    </Label>
                    <Input
                      id="cash_collection_amount"
                      type="number"
                      value={parcelForm.cash_collection_amount}
                      onChange={(e) =>
                        setParcelForm((prev) => ({
                          ...prev,
                          cash_collection_amount: e.target.value,
                        }))
                      }
                      placeholder="Cash on delivery amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merchant_invoice_id">
                      Merchant Invoice ID
                    </Label>
                    <Input
                      id="merchant_invoice_id"
                      value={parcelForm.merchant_invoice_id}
                      onChange={(e) =>
                        setParcelForm((prev) => ({
                          ...prev,
                          merchant_invoice_id: e.target.value,
                        }))
                      }
                      placeholder="Your reference ID"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instruction">
                    Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instruction"
                    value={parcelForm.instruction}
                    onChange={(e) =>
                      setParcelForm((prev) => ({
                        ...prev,
                        instruction: e.target.value,
                      }))
                    }
                    placeholder="Special instructions for delivery..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParcelForm({
                        customer_name: "",
                        customer_phone: "",
                        delivery_area: "",
                        delivery_area_id: 0,
                        customer_address: "",
                        cash_collection_amount: "0",
                        parcel_weight: 500,
                        merchant_invoice_id: "",
                        instruction: "",
                        value: "0",
                        is_closed_box: "false",
                        pickup_store_id: undefined,
                        parcel_details_json: [],
                      });
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    onClick={handleCreateParcel}
                    disabled={
                      loading ||
                      !parcelForm.customer_name ||
                      !parcelForm.customer_phone ||
                      !parcelForm.delivery_area_id
                    }
                    className="bg-[#003333] hover:bg-[#002222] text-white"
                  >
                    {loading ? "Creating Parcel..." : "Create Parcel"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Store Tab */}
        <TabsContent value="create-store">
          <Card>
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
                  />
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name} ({area.post_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    }}
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
        </TabsContent>

        {/* Quick Tools Tab */}
        <TabsContent value="quick-tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle size={20} />
                Quick Tools
              </CardTitle>
              <CardDescription>
                Useful tools for RedX operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("calculator")}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">Quick Calculator</h3>
                        <p className="text-sm text-gray-600">
                          Calculate charges instantly
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("tracking")}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">Quick Track</h3>
                        <p className="text-sm text-gray-600">
                          Track any parcel instantly
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => loadAreas()}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <RefreshCw className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">Refresh Data</h3>
                        <p className="text-sm text-gray-600">
                          Reload all data from API
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Eye className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-bold">API Status</h3>
                            <p className="text-sm text-gray-600">
                              Check RedX API status
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>RedX API Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Base URL:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded"></code>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Status:</span>
                        <div className="bg-green-100 text-green-800">
                          Connected
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {/* <p>
                          Token Status: {TOKEN ? "✓ Configured" : "✗ Missing"}
                        </p> */}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
