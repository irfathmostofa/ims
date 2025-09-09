"use client";

import { Plus, Minus, History, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function Cart({
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
  setPaymentMethod,
  paymentMethod,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  adjustQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  total: number;
  handleClear: () => void; // confirmation clear
  clearAfterSave: () => void; // clear without confirm (used after save)
  handlePay: () => void;
  cartClear: () => void;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  setCustomerName: (s: string) => void;
  setCustomerPhone: (s: string) => void;
  setCustomerAddress: (s: string) => void;
  setPaymentMethod: (s: string) => void;
  paymentMethod: string;
}) {
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [paymentType, setPaymentType] = useState<"paid" | "partial" | "due">(
  //   "paid"
  // );
  // const [partialAmount, setPartialAmount] = useState("");
  // load saved carts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedCarts");
      if (raw) setSavedCarts(JSON.parse(raw));
    } catch {
      setSavedCarts([]);
    }
  }, []);

  // persist savedCarts whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("savedCarts", JSON.stringify(savedCarts));
    } catch {
      // ignore
    }
  }, [savedCarts]);

  // Save current cart into savedCarts (persisted)
  const saveCart = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Nothing to save.");
      return;
    }

    const newSaved: SavedCart = {
      id: Date.now().toString(),
      items: cart.map((i) => ({ ...i })), // clone
      total,
      date: new Date().toLocaleString(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
    };

    setSavedCarts((prev) => [newSaved, ...prev]);
    // clear current cart & fields without confirmation
    clearAfterSave();
    // auto-close the saved dialog if open
    setIsDialogOpen(false);
  };

  // Restore a saved cart (replace current cart and fill customer info)
  const restoreCart = (saved: SavedCart) => {
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

  return (
    <div className="w-full md:w-96 bg-bw-50 p-4 rounded-md shadow-md flex flex-col border ">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-bw-900 font-bold text-xl flex-3">Cart</h2>

        {/* Saved carts dialog trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex items-center gap-2">
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 bg-bw-200 hover:bg-bw-300 px-3 py-1 rounded-md text-sm">
                <History size={16} /> Saved
              </button>
            </DialogTrigger>

            {/* Clear / New (confirmed clear) */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              onClick={cartClear}
              title="Clear cart"
            >
              Clear
            </button>
          </div>

          <DialogContent className="max-w-lg bg-amber-50">
            <DialogHeader>
              <DialogTitle>Saved Carts</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-80 overflow-y-auto mt-2">
              {savedCarts.length === 0 && (
                <p className="text-bw-500">No saved carts yet.</p>
              )}

              {savedCarts.map((saved) => (
                <div
                  key={saved.id}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium text-bw-800">
                      {saved.items.length} items
                    </p>
                    <p className="text-sm text-bw-600">
                      Total: ${saved.total} • {saved.date}
                    </p>
                    {saved.customerName && (
                      <p className="text-sm text-bw-600">
                        Customer: {saved.customerName}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-1 text-sm"
                      onClick={() => restoreCart(saved)}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 text-sm"
                      onClick={() => deleteCart(saved.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-4 flex justify-between gap-2">
              {/* <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button> */}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 text-sm"
                  onClick={deleteAll}
                >
                  Delete All
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {cart.length === 0 && (
          <p className="text-bw-500">No items in the cart.</p>
        )}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-2 bg-bw-100 rounded-md"
          >
            <div>
              <p className="text-bw-800 font-medium">{item.name}</p>
              <p className="text-bw-700 text-sm">
                ${item.price} x {item.quantity} = ${item.price * item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, 1)}
              >
                <Plus size={16} />
              </button>
              <button
                className="ml-2 text-red-500 font-bold px-2 py-1 hover:bg-bw-200 rounded-md"
                onClick={() => removeFromCart(item.id)}
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 border-t border-bw-200 pt-4 flex flex-col gap-2">
        {/* Payment Method Selection */}
        <div className="flex gap-4 items-center mb-2">
          <span className="font-medium text-bw-700 mr-2">Payment:</span>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cash"}
              className="accent-bw-700"
              onChange={() => setPaymentMethod("cash")}
            />
            <span>Cash</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              className="accent-bw-700"
              onChange={() => setPaymentMethod("card")}
            />
            <span>Card</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "online"}
              className="accent-bw-700"
              onChange={() => setPaymentMethod("online")}
            />
            <span>Online</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-bw-primary flex-1 py-2 text-lg font-semibold"
            disabled={cart.length === 0}
            onClick={saveCart}
          >
            Save
          </button>

          <button
            className="bg-green-500 hover:bg-green-600 text-white flex-1 py-2 rounded-md font-semibold"
            onClick={handleClear}
          >
            New
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="btn-bw-primary flex-1 py-2 text-lg font-semibold"
            onClick={handlePay}
          >
            Pay ${total}
          </button>
        </div>
      </div>
    </div>
  );
}
