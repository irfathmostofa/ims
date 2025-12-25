"use client";

import { Plus, Minus, History, Trash2, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type SavedCart = {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

type PaymentType = "paid" | "partial" | "due";
type PaymentMethod = "cash" | "card" | "online" | "";

interface CartProps {
  loading: boolean;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  adjustQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  total: number;
  handleClear: () => void;
  clearAfterSave: () => void;
  handlePay: () => void;
  cartClear: () => void;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerAddress: (address: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  partialAmount: string;
  setPartialAmount: (amount: string) => void;
}

export default function Cart({
  loading,
  cart,
  setCart,
  adjustQuantity,
  removeFromCart,
  total,
  handleClear,
  clearAfterSave,
  handlePay,
  cartClear,
  customerName,
  customerPhone,
  customerAddress,
  setCustomerName,
  setCustomerPhone,
  setCustomerAddress,
  paymentMethod,
  setPaymentMethod,
  paymentType,
  setPaymentType,
  partialAmount,
  setPartialAmount,
}: CartProps) {
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load saved carts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedCarts");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Validate saved carts structure
        const validCarts = parsed.filter(
          (cart: any) =>
            Array.isArray(cart.items) &&
            cart.items.every(
              (item: any) =>
                item.id &&
                item.name &&
                typeof item.price === "number" &&
                typeof item.quantity === "number"
            )
        );
        setSavedCarts(validCarts);
      }
    } catch {
      setSavedCarts([]);
    }
  }, []);

  // Persist savedCarts whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("savedCarts", JSON.stringify(savedCarts));
    } catch {
      // ignore
    }
  }, [savedCarts]);

  // Save current cart into savedCarts
  const saveCart = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Nothing to save.");
      return;
    }

    const newSaved: SavedCart = {
      id: Date.now().toString(),
      items: cart.map((i) => ({ ...i })),
      total,
      date: new Date().toLocaleString(),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
    };

    setSavedCarts((prev) => [newSaved, ...prev.slice(0, 19)]); // Keep only last 20 carts
    clearAfterSave();
    setIsDialogOpen(false);
  };

  // Restore a saved cart
  const restoreCart = (saved: SavedCart) => {
    if (
      cart.length > 0 &&
      !confirm("This will replace current cart. Continue?")
    ) {
      return;
    }

    setCart(saved.items.map((i) => ({ ...i })));
    if (saved.customerName) setCustomerName(saved.customerName);
    if (saved.customerPhone) setCustomerPhone(saved.customerPhone);
    if (saved.customerAddress) setCustomerAddress(saved.customerAddress);
    setIsDialogOpen(false);
  };

  // Delete saved cart
  const deleteCart = (id: string) => {
    if (!confirm("Delete this saved cart?")) return;
    setSavedCarts((prev) => prev.filter((s) => s.id !== id));
  };

  // Delete all saved carts
  const deleteAll = () => {
    if (!confirm("Delete all saved carts?")) return;
    setSavedCarts([]);
  };

  const calculateDisplayTotal = () => {
    if (paymentType === "partial") {
      const partial = parseFloat(partialAmount);
      if (!isNaN(partial) && partial > 0) {
        return partial;
      }
    } else if (paymentType === "due") {
      return 0;
    }
    return total;
  };

  const displayTotal = calculateDisplayTotal();

  // Handle payment type change
  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    if (type === "due") {
      setPaymentMethod(""); // Clear payment method for due payments
    } else if (type === "partial") {
      setPartialAmount("");
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (paymentType !== "due") {
      setPaymentMethod(method);
    }
  };

  return (
    <div className="w-full md:w-96 bg-white p-4 rounded-lg shadow-md flex flex-col border border-bw-200 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-bw-900 font-bold text-xl">Cart</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <button
                className="flex items-center gap-2 bg-bw-100 hover:bg-bw-200 px-3 py-1.5 rounded-md text-sm transition-colors"
                title="View saved carts"
              >
                <History size={16} /> Saved
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Saved Carts</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-2">
                {savedCarts.length === 0 ? (
                  <p className="text-bw-500 text-center py-4">
                    No saved carts yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedCarts.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-bw-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-bw-800">
                            {saved.items.length} item
                            {saved.items.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-bw-600">
                            Total: ৳{saved.total.toFixed(2)} • {saved.date}
                          </p>
                          {saved.customerName && (
                            <p className="text-sm text-bw-600">
                              Customer: {saved.customerName}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-1 text-sm transition-colors"
                            onClick={() => restoreCart(saved)}
                            title="Restore cart"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 text-sm transition-colors"
                            onClick={() => deleteCart(saved.id)}
                            title="Delete cart"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4 pt-4 border-t">
                {savedCarts.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={deleteAll}
                    className="w-full"
                  >
                    Delete All Saved Carts
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            onClick={cartClear}
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-bw-400">
            <p className="text-lg">Your cart is empty</p>
            <p className="text-sm mt-1">Add products from the list</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-1 bg-bw-50 rounded-lg border-bw w-full"
            >
              <div className="w-2/3">
                <p
                  className="text-bw-800 font-medium text-sm truncate"
                  title={item.name}
                >
                  {item.name}
                </p>
                <p className="text-bw-600 text-xs">
                  ৳{item.price} × {item.quantity} = ৳
                  {item.price * item.quantity}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center border border-bw-300 rounded ">
                  <button
                    className="p-1 hover:bg-bw-200 disabled:opacity-50"
                    onClick={() => adjustQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 min-w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    className="p-1 hover:bg-bw-200"
                    onClick={() => adjustQuantity(item.id, 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  className="ml-2 text-xs text-white hover:text-red-700 p-1 bg-red-500 hover:bg-red-50 rounded transition-colors "
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div className="border-t border-bw-200 pt-2 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-bw-700 font-medium">Subtotal:</span>
            <span className="text-bw-900 font-semibold">
              ৳{total.toFixed(2)}
            </span>
          </div>

          {paymentType === "partial" && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-bw-700">Partial Payment:</span>
              <span className="text-amber-600 font-semibold">
                ৳{displayTotal.toFixed(2)}
              </span>
            </div>
          )}

          {paymentType === "due" && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-bw-700">Due Amount:</span>
              <span className="text-red-600 font-semibold">
                ৳{total.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Combined Payment Settings */}
      {cart.length > 0 && (
        <div className="">
          {/* Payment Type & Method in Row */}
          <div className="grid grid-cols-2 gap-1">
            {/* Payment Type */}
            <div className="space-y-2">
              <label className="block text-bw-700 text-sm font-medium mb-1">
                Payment Type
              </label>
              <div className="flex flex-wrap gap-1">
                {(["paid", "partial", "due"] as PaymentType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === type}
                      onChange={() => handlePaymentTypeChange(type)}
                      className="h-4 w-4 accent-bw-700"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method - Only show when not "due" */}
            {paymentType !== "due" && (
              <div className="space-y-2">
                <label className="block text-bw-700 text-sm font-medium mb-1">
                  Payment Method
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["cash", "card", "online"] as PaymentMethod[]).map(
                    (method) => (
                      <label
                        key={method}
                        className="flex items-center gap-1 cursor-pointer "
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method}
                          onChange={() => handlePaymentMethodChange(method)}
                          className="h-4 w-4 accent-bw-700"
                        />
                        <span className="text-sm capitalize">{method}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Partial Amount Input - Only show when "partial" */}
          {paymentType === "partial" && (
            <div className="my-1">
              <label className="block text-bw-700 text-sm font-medium mb-1">
                Partial Amount
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={partialAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseFloat(value);
                    if (
                      value === "" ||
                      (!isNaN(num) && num >= 0 && num <= total)
                    ) {
                      setPartialAmount(value);
                    }
                  }}
                  min="0"
                  max={total}
                  step="0.01"
                  className="flex-1"
                />
                <div className="text-xs text-bw-500 whitespace-nowrap">
                  Remaining: ৳
                  {Math.max(
                    total - parseFloat(partialAmount || "0"),
                    0
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          className="w-full bg-bw-700 hover:bg-bw-800 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={saveCart}
          disabled={cart.length === 0}
        >
          <Save size={16} /> Save Cart
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="bg-bw-200 hover:bg-bw-300 text-bw-800 py-2.5 rounded-md font-medium transition-colors"
            onClick={handleClear}
          >
            New Sale
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePay}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Processing..." : `Pay ৳${displayTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
