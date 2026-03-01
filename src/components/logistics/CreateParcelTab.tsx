import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Calculator,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Loader2,
  DollarSign,
  Weight,
  User,
  MapPin as MapPinIcon,
  MessageSquare,
  ShoppingBag,
  Package2,
  Copy,
  Tag,
} from "lucide-react";
import { redxApi } from "@/hook/RedXApi";
import { useQuickStore } from "@/store/quickStore";
import type {
  Area,
  CreateParcelData,
  ParcelItem,
  PickupStore,
} from "@/types/redx";
import CustomInput from "../ui/custom/customInput";

// Define the actual product interface based on your API response
interface Product {
  product_id: number;
  variant_id: number;
  code: string;
  product_name: string;
  variant_name: string;
  display_name: string;
  description: string;
  selling_price: string; // Comes as string from API
  cost_price: string;
  additional_price: string;
  uom_symbol: string;
  uom_name: string;
  weight: number;
  weight_unit: string;
  sku: string;
  category_name: string;
  stock_qty: string; // Comes as string from API
  status: string;
  variant_status: string;
  branch_name?: string;
  branch_id?: number | null;
  image?: string; // Optional field
}

export const CreateParcelTab = () => {
  const { products, fetchProducts } = useQuickStore();
  console.log(products);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cast products to the correct type
  const storeProducts: Product[] = (products || []) as Product[];

  const [loading, setLoading] = useState<boolean>(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [pickupStores, setPickupStores] = useState<PickupStore[]>([]);
  const [postalCode, setPostalCode] = useState<string>("");
  const [areasLoading, setAreasLoading] = useState<boolean>(false);

  // Product selection states
  const [selectedProducts, setSelectedProducts] = useState<ParcelItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [showProductDialog, setShowProductDialog] = useState<boolean>(false);

  // Create parcel form
  const [parcelForm, setParcelForm] = useState<CreateParcelData>({
    customer_name: "",
    customer_phone: "",
    delivery_area: "",
    delivery_area_id: 0,
    customer_address: "",
    cash_collection_amount: "0",
    parcel_weight: 0,
    merchant_invoice_id: "",
    instruction: "",
    value: "0",
    is_closed_box: "false",
    pickup_store_id: 0,
    parcel_details_json: [],
  });

  // Calculate totals
  const parcelTotals = useMemo(() => {
    const subtotal = selectedProducts.reduce(
      (sum, item) => sum + item.value * item.quantity,
      0,
    );
    const totalWeight = selectedProducts.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0,
    );
    const totalItems = selectedProducts.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      subtotal,
      totalWeight,
      totalItems,
    };
  }, [selectedProducts]);

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
  // Load pickup stores on component mount
  useEffect(() => {
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

    loadPickupStores();
  }, []);
  // Parse price and stock from string to number with fallbacks
  const parsePrice = (price: string): number => {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseStock = (stock: string): number => {
    const parsed = parseFloat(stock);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Product selection handlers
  const handleAddProduct = (product: Product) => {
    const productId = `${product.product_id}-${product.variant_id}`;
    const existingItem = selectedProducts.find((p) => p.id === productId);

    if (existingItem) {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      const price = parsePrice(product.selling_price);

      const newItem: ParcelItem = {
        id: productId,
        name: product.display_name, // Use display_name which includes variant
        category: product.category_name,
        value: price,
        quantity: 1,
        weight: product.weight || 0,
        sku: product.code,
        brand: "", // Not provided in API
        image: product.image,
      };
      setSelectedProducts((prev) => [...prev, newItem]);
    }

    toast.success(`${product.display_name} added to parcel`);
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
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
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

      const parcelDetails = selectedProducts.map((item) => ({
        name: item.name,
        category: item.category,
        value: item.value,
        quantity: item.quantity,
        weight: item.weight,
      }));

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
        </div>,
      );

      // Reset form
      setParcelForm({
        customer_name: "",
        customer_phone: "",
        delivery_area: "",
        delivery_area_id: 0,
        customer_address: "",
        cash_collection_amount: "0",
        parcel_weight: 0,
        merchant_invoice_id: "",
        instruction: "",
        value: "0",
        is_closed_box: "false",
        pickup_store_id: undefined,
        parcel_details_json: [],
      });
      setSelectedProducts([]);
      setPostalCode("");
      setAreas([]);
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

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return storeProducts;

    const searchLower = productSearch.toLowerCase();
    return storeProducts.filter(
      (product) =>
        product.display_name.toLowerCase().includes(searchLower) ||
        product.product_name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower) ||
        product.category_name.toLowerCase().includes(searchLower),
    );
  }, [storeProducts, productSearch]);

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
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomInput
                placeholder="Search products by name, code, category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            {storeProducts.length === 0 ? (
              <div className="text-center py-12 bg-white">
                <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No products found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Products will appear here from your store
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredProducts.map((product) => {
                  const price = parsePrice(product.selling_price);
                  const stock = parseStock(product.stock_qty);
                  const productId = `${product.product_id}-${product.variant_id}`;

                  return (
                    <Card
                      key={productId}
                      className="overflow-hidden hover:shadow-md transition-shadow bg-white"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {product.image ? (
                            <div className="w-16 h-16 rounded-md overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.display_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                              <Package2 className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm line-clamp-2">
                                {product.display_name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs bg-white"
                              >
                                {product.category_name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Tag size={10} className="text-gray-400" />
                              <p className="text-xs text-gray-500">
                                Code: {product.code}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>Variant: {product.variant_name}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-green-600">
                                ৳{price.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Stock: {stock}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-[#003333] hover:bg-[#002222] text-white"
                          onClick={() => handleAddProduct(product)}
                          disabled={stock === 0}
                        >
                          <Plus size={14} className="mr-2" />
                          Add to Parcel
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between bg-white">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} of {storeProducts.length} products found
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
    <div className="space-y-6">
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
                  <CustomInput
                    label="Customer Name *"
                    value={parcelForm.customer_name}
                    onChange={(e) =>
                      setParcelForm((prev) => ({
                        ...prev,
                        customer_name: e.target.value,
                      }))
                    }
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <CustomInput
                    label="Customer Phone *"
                    value={parcelForm.customer_phone}
                    onChange={(e) =>
                      setParcelForm((prev) => ({
                        ...prev,
                        customer_phone: e.target.value,
                      }))
                    }
                    placeholder="01XXXXXXXXX"
                    required
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
                  className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Area Search */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calculator size={14} />
                  Search Delivery Area by Postal Code *
                </Label>
                <div className="flex gap-2">
                  <CustomInput
                    placeholder="Enter postal code (e.g., 1206)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    type="number"
                    required
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="delivery_area"
                    className="flex items-center gap-1"
                  >
                    <Calculator size={14} />
                    Delivery Area *
                  </Label>
                  <Select
                    value={parcelForm.delivery_area_id.toString()}
                    onValueChange={(value) => {
                      const area = areas.find((a) => a.id === parseInt(value));
                      setParcelForm((prev) => ({
                        ...prev,
                        delivery_area: area?.name || "",
                        delivery_area_id: parseInt(value),
                      }));
                    }}
                    disabled={areas.length === 0}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
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
                  {areas.length === 0 && (
                    <p className="text-xs text-gray-500">
                      Search for areas by postal code first
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_area">Pickup Area</Label>
                  <Select
                    value={parcelForm.pickup_store_id?.toString() || ""}
                    onValueChange={(value) =>
                      setParcelForm((prev) => ({
                        ...prev,
                        pickup_store_id: parseInt(value),
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
                          value={store.id.toString()}
                          className="bg-white hover:bg-gray-100"
                        >
                          {store.name} ({store.area_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <CustomInput
                    label="Invoice ID"
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
                  className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                          variant="default"
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
                            Are you sure you want to remove all products from
                            the parcel?
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
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProducts.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
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
                                  className="h-6 w-6 bg-white border-gray-300 hover:bg-gray-100"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1,
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
                                  className="h-6 w-6 bg-white border-gray-300 hover:bg-gray-100"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  <Plus size={12} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ৳{item.value.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ৳{(item.value * item.quantity).toFixed(2)}
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
                          <p className="text-sm text-gray-600">Total Items</p>
                          <p className="text-xl font-bold">
                            {parcelTotals.totalItems}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Weight className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Total Weight</p>
                          <p className="text-xl font-bold">
                            {parcelTotals.totalWeight}g
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <DollarSign className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="text-xl font-bold">
                            ৳{parcelTotals.subtotal.toFixed(2)}
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
                  <CustomInput
                    value={parcelTotals.totalWeight}
                    readonly={true}
                    className="text-center font-semibold"
                  />
                  <span className="text-sm text-gray-600">g</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign size={14} />
                  COD Amount
                </Label>
                <CustomInput
                  value={`৳${parcelTotals.subtotal.toFixed(2)}`}
                  readonly={true}
                  className="text-center font-semibold text-green-600"
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
              <CardTitle className="text-green-700">Create Parcel</CardTitle>
              <CardDescription className="text-green-600">
                Review details and create parcel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{parcelTotals.totalItems}</span>
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
                    ৳{parcelTotals.subtotal.toFixed(2)}
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
                    <AlertDialogTitle>Confirm Parcel Creation</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-2 mt-2">
                        <p>
                          Are you sure you want to create this parcel with the
                          following details?
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
                              ৳{parcelTotals.subtotal.toFixed(2)}
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

      {/* Product Selection Dialog */}
      <ProductDialog />
    </div>
  );
};
