import React, { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

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
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Loader2,
  DollarSign,
  Weight,
  Hash,
  User,
  PhoneCall,
  MapPin as MapPinIcon,
  MessageSquare,
  ShoppingBag,
  Package2,
} from "lucide-react";
import { redxApi } from "@/hook/RedXApi";
import { useQuickStore } from "@/store/quickStore";

// Import proper types from your types file
import type {
  Area,
  CreateParcelData,
  CreateStoreData,
  PickupStore,
  ChargeParams,
  ChargeResponse,
  Product,
  ParcelItem,
  ParcelInfo as RedXParcelInfo,
  TrackingUpdate,
} from "@/types/redx";

export const Logistics = () => {
  const [activeTab, setActiveTab] = useState<string>("areas");
  const [loading, setLoading] = useState<boolean>(false);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  // Get products and categories from store - ensure proper typing
  const store = useQuickStore();
  const products = store.products || [];
  const categories = store.categories || [];

  // States for different tabs
  const [areas, setAreas] = useState<Area[]>([]);
  const [pickupStores, setPickupStores] = useState<PickupStore[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Product selection states
  const [selectedProducts, setSelectedProducts] = useState<ParcelItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showProductDialog, setShowProductDialog] = useState<boolean>(false);

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
  const [trackingData, setTrackingData] = useState<TrackingUpdate[]>([]);
  const [parcelInfo, setParcelInfo] = useState<RedXParcelInfo | null>(null);

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

  // Calculate totals
  const parcelTotals = useMemo(() => {
    const subtotal = selectedProducts.reduce(
      (sum, item) => sum + item.value * item.quantity,
      0
    );
    const totalWeight = selectedProducts.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );
    const totalItems = selectedProducts.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      subtotal,
      totalWeight,
      totalItems,
    };
  }, [selectedProducts]);

  // Load initial data
  useEffect(() => {
    if (activeTab === "areas") {
      loadAreas();
    } else if (activeTab === "stores") {
      loadPickupStores();
    } else if (activeTab === "create-parcel") {
      if (!parcelForm.delivery_area_id && areas.length > 0) {
        const defaultArea = areas.find((a) => a.id === 1);
        if (defaultArea) {
          setParcelForm((prev) => ({
            ...prev,
            delivery_area: defaultArea.name,
            delivery_area_id: defaultArea.id,
          }));
        }
      }
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
          area.division_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          area.post_code.toString().includes(searchQuery)
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
      setTrackingData([]);
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
      toast.success(`Store created successfully! ID: ${result.id}`);

      setStoreForm({
        name: "",
        phone: "",
        address: "",
        area_id: 0,
      });

      loadPickupStores();
      setActiveTab("stores");
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast.error(error.message || "Failed to create pickup store");
    } finally {
      setLoading(false);
    }
  };

  // Product selection handlers
  const handleAddProduct = (product: Product) => {
    const existingItem = selectedProducts.find(
      (p) => p.id === product.id.toString()
    );

    if (existingItem) {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.id === product.id.toString()
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Convert Product to ParcelItem
      const newItem: ParcelItem = {
        id: product.code,
        name: product.product_name,
        category: product.category_name || "Uncategorized",
        value: product.selling_price || 0,
        quantity: 1,
        weight: product.weight,
        sku: product.sku,
        brand: "non-branded",
        image: product.image,
      };
      setSelectedProducts((prev) => [...prev, newItem]);
    }

    toast.success(`${product.product_name} added to parcel`);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Product removed");
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveProduct(productId);
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleClearProducts = () => {
    setSelectedProducts([]);
    toast.success("All products cleared");
  };

  const handleCreateParcel = async () => {
    const requiredFields = [
      parcelForm.customer_name,
      parcelForm.customer_phone,
      parcelForm.delivery_area_id,
      parcelForm.customer_address,
    ];

    if (requiredFields.some((field) => !field)) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to the parcel");
      return;
    }

    setLoading(true);
    try {
      const totalValue = parcelTotals.subtotal;
      const totalWeight = parcelTotals.totalWeight;

      // Prepare parcel details for API
      const parcelDetails = selectedProducts.map((item) => ({
        name: item.name,
        category: item.category,
        value: item.value,
        quantity: item.quantity,
        weight: item.weight,
      }));

      // Prepare API payload
      const payload: CreateParcelData = {
        ...parcelForm,
        cash_collection_amount: totalValue.toString(),
        parcel_weight: totalWeight,
        value: totalValue.toString(),
        parcel_details_json: parcelDetails,
      };

      const result = await redxApi.createParcel(payload);

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Parcel Created Successfully!</span>
          <span>Tracking ID: {result.tracking_id}</span>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => copyToClipboard(result.tracking_id)}
          >
            <Copy size={14} className="mr-2" />
            Copy Tracking ID
          </Button>
        </div>
      );

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
      setSelectedProducts([]);
      setTrackingId(result.tracking_id);
      setActiveTab("tracking");
    } catch (error: any) {
      console.error("Failed to create parcel:", error);
      toast.error(error.message || "Failed to create parcel");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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
      <div
        className={`${config.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        {config.icon}
        {status.replace("-", " ").toUpperCase()}
      </div>
    );
  };

  // Product Dialog Component
  const ProductDialog = () => (
    <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag size={20} />
            Select Products for Parcel
          </DialogTitle>
          <DialogDescription>
            Search and select products to include in the parcel
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            {productsLoading ? (
              <div className="flex items-center justify-center h-48 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white">
                <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No products found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different search or category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {products.map((product) => (
                  <Card
                    key={product.code}
                    className="overflow-hidden hover:shadow-md transition-shadow bg-white"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {product.product_name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {product.category_name || "Uncategorized"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {"N/A"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-green-600">
                              ৳{product.selling_price || 0}
                            </span>
                            <span className="text-xs text-gray-500">
                              Stock: {product.stock_qty || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-[#003333] hover:bg-[#002222] text-white"
                        onClick={() => handleAddProduct(product)}
                        disabled={(product.stock_qty || 0) === 0}
                      >
                        <Plus size={14} className="mr-2" />
                        Add to Parcel
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between bg-white">
          <div className="text-sm text-gray-600">
            {products.length} products found
          </div>
          <Button
            onClick={() => setShowProductDialog(false)}
            className="bg-[#003333] hover:bg-[#002222] text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
            <Package2 size={12} />
            {parcelTotals.totalItems} Items
          </Badge>
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
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 w-full overflow-x-auto bg-white">
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

        {/* Areas Tab */}
        <TabsContent value="areas" className="space-y-6">
          <Card className="bg-white">
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
                        className="pl-10 bg-white"
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
                      className="bg-white"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={loadAreas}
                      disabled={loading}
                      className="bg-[#003333] hover:bg-[#002222] text-white"
                    >
                      {loading ? "Loading..." : "Refresh Areas"}
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 bg-white">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading areas...</p>
                </div>
              ) : filteredAreas.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-white">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No areas found</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 mt-1">
                      Try a different search term or clear the search
                    </p>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
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
                          <TableRow key={area.id} className="hover:bg-gray-50">
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
                              <div className="font-mono">{area.post_code}</div>
                            </TableCell>
                            <TableCell>{area.division_name}</TableCell>
                            <TableCell>
                              <div className="font-medium">
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
                                className="text-[#003333] hover:text-[#002222] hover:bg-gray-100"
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
            <Card className="bg-white">
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
            <Card className="bg-white">
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
            <Card className="bg-white">
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
            <Card className="bg-white">
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
          <Card className="bg-white">
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
                <div className="text-center py-8 border rounded-lg bg-white">
                  <Store className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No pickup stores found</p>
                  <Button
                    onClick={() => setActiveTab("create-store")}
                    className="mt-4 bg-[#003333] hover:bg-[#002222] text-white"
                  >
                    Create Your First Store
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pickupStores.map((store) => (
                    <Card
                      key={store.id}
                      className="overflow-hidden bg-white hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {store.name}
                              </h3>
                              <div className="mt-1 text-sm text-gray-500">
                                ID: {store.id}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  `${store.name} - ${store.address}`
                                )
                              }
                              className="text-gray-500 hover:text-gray-700"
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
                            className="w-full border-[#003333] text-[#003333] hover:bg-[#003333] hover:text-white"
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
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select pickup area" />
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
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select delivery area" />
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
                      className="bg-white"
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
                      className="bg-white"
                    />
                  </div>

                  <Button
                    onClick={handleCalculateCharge}
                    disabled={
                      loading ||
                      !chargeParams.pickup_area_id ||
                      !chargeParams.delivery_area_id
                    }
                    className="w-full bg-[#003333] hover:bg-[#002222] text-white"
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
        </TabsContent>

        {/* Track Parcel Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card className="bg-white">
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
                      className="text-lg bg-white"
                    />
                  </div>
                  <Button
                    onClick={handleTrackParcel}
                    disabled={loading}
                    className="bg-[#003333] hover:bg-[#002222] text-white"
                  >
                    {loading ? "Tracking..." : "Track Parcel"}
                  </Button>
                </div>

                {parcelInfo && (
                  <Card className="bg-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">
                          Parcel Information
                        </h3>
                        <div>{getStatusBadge(parcelInfo.status)}</div>
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
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Tracking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trackingData.map(
                          (update: TrackingUpdate, index: number) => (
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
                          )
                        )}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Enter recipient details for delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="customer_name"
                        className="flex items-center gap-1"
                      >
                        <User size={14} />
                        Customer Name *
                      </Label>
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
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="customer_phone"
                        className="flex items-center gap-1"
                      >
                        <PhoneCall size={14} />
                        Customer Phone *
                      </Label>
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
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customer_address"
                      className="flex items-center gap-1"
                    >
                      <MapPinIcon size={14} />
                      Delivery Address *
                    </Label>
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
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="delivery_area"
                        className="flex items-center gap-1"
                      >
                        <Navigation size={14} />
                        Delivery Area *
                      </Label>
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
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select delivery area" />
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
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="merchant_invoice_id"
                        className="flex items-center gap-1"
                      >
                        <Hash size={14} />
                        Invoice ID
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
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="instruction"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
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
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Parcel Contents
                      </CardTitle>
                      <CardDescription>
                        Add products to include in the parcel
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedProducts.length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Clear All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Clear All Products
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove all products
                                from the parcel?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleClearProducts}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Clear All
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button
                        onClick={() => setShowProductDialog(true)}
                        className="bg-[#003333] hover:bg-[#002222] text-white"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Products
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedProducts.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-white">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No products added yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Click "Add Products" to select items for your parcel
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[40px]">#</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">
                                Category
                              </TableHead>
                              <TableHead className="text-center">
                                Quantity
                              </TableHead>
                              <TableHead className="text-right">
                                Price
                              </TableHead>
                              <TableHead className="text-right">
                                Total
                              </TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProducts.map((item, index) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    {item.sku && (
                                      <div className="text-xs text-gray-500">
                                        SKU: {item.sku}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      Weight: {item.weight}g each
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-white">
                                    {item.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 bg-white"
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item.id,
                                          item.quantity - 1
                                        )
                                      }
                                    >
                                      <Minus size={12} />
                                    </Button>
                                    <span className="font-medium w-8 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 bg-white"
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item.id,
                                          item.quantity + 1
                                        )
                                      }
                                    >
                                      <Plus size={12} />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  ৳{item.value}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  ৳{item.value * item.quantity}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRemoveProduct(item.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <Package2 className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Total Items
                              </p>
                              <p className="text-xl font-bold">
                                {parcelTotals.totalItems}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <Weight className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Total Weight
                              </p>
                              <p className="text-xl font-bold">
                                {parcelTotals.totalWeight}g
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <DollarSign className="h-8 w-8 text-purple-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Total Value
                              </p>
                              <p className="text-xl font-bold">
                                ৳{parcelTotals.subtotal}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary and Actions */}
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator size={20} />
                    Quick Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Weight size={14} />
                      Estimated Weight
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={parcelTotals.totalWeight}
                        readOnly
                        className="text-center font-semibold bg-white"
                      />
                      <span className="text-sm text-gray-600">g</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <DollarSign size={14} />
                      COD Amount
                    </Label>
                    <Input
                      value={`৳${parcelTotals.subtotal}`}
                      readOnly
                      className="text-center font-semibold text-green-600 bg-white"
                    />
                  </div>
                  <hr />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Delivery Area</p>
                    <p className="font-semibold text-lg mt-1">
                      {parcelForm.delivery_area || "Not selected"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700">
                    Create Parcel
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Review details and create parcel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">
                        {parcelTotals.totalItems}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">
                        {parcelTotals.totalWeight}g
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Value:</span>
                      <span className="font-semibold text-green-600">
                        ৳{parcelTotals.subtotal}
                      </span>
                    </div>
                  </div>

                  <hr />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full bg-[#003333] hover:bg-[#002222] text-white h-12"
                        disabled={
                          loading ||
                          !parcelForm.customer_name ||
                          !parcelForm.customer_phone ||
                          !parcelForm.delivery_area_id ||
                          !parcelForm.customer_address ||
                          selectedProducts.length === 0
                        }
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Package size={18} className="mr-2" />
                            Create Parcel
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirm Parcel Creation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-2 mt-2">
                            <p>
                              Are you sure you want to create this parcel with
                              the following details?
                            </p>
                            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Customer:</span>
                                <span className="font-medium">
                                  {parcelForm.customer_name}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery Area:</span>
                                <span className="font-medium">
                                  {parcelForm.delivery_area}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Items:</span>
                                <span className="font-medium">
                                  {parcelTotals.totalItems}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>COD Amount:</span>
                                <span className="font-semibold text-green-600">
                                  ৳{parcelTotals.subtotal}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCreateParcel}
                          className="bg-[#003333] hover:bg-[#002222]"
                        >
                          Create Parcel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="text-xs text-center text-gray-500 pt-2">
                    <p>By creating a parcel, you agree to RedX&apos;s</p>
                    <p>terms and conditions of service.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Create Store Tab */}
        <TabsContent value="create-store">
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
        </TabsContent>
      </Tabs>

      {/* Product Selection Dialog */}
      <ProductDialog />
    </div>
  );
};
