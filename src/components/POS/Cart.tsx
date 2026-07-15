"use client";

import {
  Plus,
  Minus,
  History,
  Trash2,
  RotateCcw,
  Save,
  X,
  PlusCircle,
} from "lucide-react";
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

export type PaymentType = "PAID" | "PARTIAL" | "DUE";
export type PaymentMethod = "CASH" | "BANK" | "ONLINE" | "";

// A single payment entry
export type PaymentEntry = {
  id: string; // local UI id
  method: "CASH" | "BANK" | "ONLINE";
  amount: string; // string so input is editable
};

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
  // Multi-payment
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  payments: PaymentEntry[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentEntry[]>>;
}

const METHOD_COLORS: Record<string, string> = {
  CASH: "bg-emerald-100 text-emerald-800 border-emerald-300",
  BANK: "bg-blue-100 text-blue-800 border-blue-300",
  ONLINE: "bg-purple-100 text-purple-800 border-purple-300",
};

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
  paymentType,
  setPaymentType,
  payments,
  setPayments,
}: CartProps) {
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load saved carts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedCarts");
      if (raw) {
        const parsed = JSON.parse(raw);
        const validCarts = parsed.filter(
          (cart: any) =>
            Array.isArray(cart.items) &&
            cart.items.every(
              (item: any) =>
                item.id &&
                item.name &&
                typeof item.price === "number" &&
                typeof item.quantity === "number",
            ),
        );
        setSavedCarts(validCarts);
      }
    } catch {
      setSavedCarts([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("savedCarts", JSON.stringify(savedCarts));
    } catch {
      // ignore
    }
  }, [savedCarts]);

  // ─── Payment helpers ────────────────────────────────────────────────────────

  const totalPAID = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0,
  );
  const remaining = Math.max(total - totalPAID, 0);
  const overPAID = totalPAID > total;

  const addPaymentRow = () => {
    // Don't allow adding if DUE
    if (paymentType === "DUE") return;
    setPayments((prev) => [
      ...prev,
      { id: Date.now().toString(), method: "CASH", amount: "" },
    ]);
  };

  const removePaymentRow = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePaymentMethod = (
    id: string,
    method: "CASH" | "BANK" | "ONLINE",
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, method } : p)),
    );
  };

  const updatePaymentAmount = (id: string, value: string) => {
    // Only allow valid numbers
    if (value !== "" && isNaN(parseFloat(value))) return;
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, amount: value } : p)),
    );
  };

  // Auto-fill remaining amount into last row
  const fillRemaining = (id: string) => {
    const otherPAID = payments
      .filter((p) => p.id !== id)
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const fill = Math.max(total - otherPAID, 0);
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, amount: fill.toFixed(2) } : p)),
    );
  };

  // When payment type changes, reset payment rows
  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    if (type === "DUE") {
      setPayments([]);
    } else if (type === "PAID") {
      setPayments([
        { id: Date.now().toString(), method: "CASH", amount: total.toFixed(2) },
      ]);
    } else {
      // PARTIAL
      setPayments([{ id: Date.now().toString(), method: "CASH", amount: "" }]);
    }
  };

  // Update the first payment row amount when total changes (only for "PAID" type)
  useEffect(() => {
    if (paymentType === "PAID" && payments.length === 1) {
      setPayments([{ ...payments[0], amount: total.toFixed(2) }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, paymentType]);

  // ─── Saved carts ────────────────────────────────────────────────────────────

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
    setSavedCarts((prev) => [newSaved, ...prev.slice(0, 19)]);
    clearAfterSave();
    setIsDialogOpen(false);
  };

  const restoreCart = (saved: SavedCart) => {
    if (
      cart.length > 0 &&
      !confirm("This will replace current cart. Continue?")
    )
      return;
    setCart(saved.items.map((i) => ({ ...i })));
    if (saved.customerName) setCustomerName(saved.customerName);
    if (saved.customerPhone) setCustomerPhone(saved.customerPhone);
    if (saved.customerAddress) setCustomerAddress(saved.customerAddress);
    setIsDialogOpen(false);
  };

  const deleteCart = (id: string) => {
    if (!confirm("Delete this saved cart?")) return;
    setSavedCarts((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteAll = () => {
    if (!confirm("Delete all saved carts?")) return;
    setSavedCarts([]);
  };

  // ─── Display total ───────────────────────────────────────────────────────────

  // const displayTotal =
  //   paymentType === "DUE" ? 0 : paymentType === "PARTIAL" ? totalPAID : total;

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md flex flex-col border border-bw-200 h-full">
      {/* Header */}
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
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col bg-amber-50">
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
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 text-sm transition-colors"
                            onClick={() => deleteCart(saved.id)}
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
                    variant="default"
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
                <div className="flex items-center border border-bw-300 rounded">
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
                  className="ml-2 text-xs text-white hover:text-red-700 p-1 bg-red-500 hover:bg-red-50 rounded transition-colors"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subtotal */}
      {cart.length > 0 && (
        <div className="border-t border-bw-200 pt-2 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-bw-700 font-medium">Subtotal:</span>
            <span className="text-bw-900 font-semibold">
              ৳{total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* ─── Payment Section ─────────────────────────────────────────────────── */}
      {cart.length > 0 && (
        <div className="space-y-3">
          {/* Payment Type */}
          <div>
            <label className="block text-bw-700 text-sm font-medium mb-1">
              Payment Type
            </label>
            <div className="flex gap-3">
              {(["PAID", "PARTIAL", "DUE"] as PaymentType[]).map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-1.5 cursor-pointer"
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

          {/* Multi-payment rows — only when not "DUE" */}
          {paymentType !== "DUE" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-bw-700 text-sm font-medium">
                  Payments
                  {paymentType === "PARTIAL" && (
                    <span className="ml-1 text-xs text-bw-500 font-normal">
                      (split across methods)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={addPaymentRow}
                  className="flex items-center gap-1 text-xs text-bw-700 hover:text-bw-900 bg-bw-100 hover:bg-bw-200 px-2 py-1 rounded transition-colors"
                >
                  <PlusCircle size={13} />
                  Add method
                </button>
              </div>

              <div className="space-y-2">
                {payments.map((p) => {
                  const otherPAID = payments
                    .filter((x) => x.id !== p.id)
                    .reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
                  const maxForRow = Math.max(total - otherPAID, 0);

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-bw-200 bg-bw-50"
                    >
                      {/* Method selector */}
                      <div className="flex gap-1">
                        {(["CASH", "BANK", "ONLINE"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updatePaymentMethod(p.id, m)}
                            title={m}
                            className={`px-2 py-1 rounded text-xs border font-medium transition-all ${
                              p.method === m
                                ? METHOD_COLORS[m]
                                : "bg-white text-bw-500 border-bw-200 hover:bg-bw-100"
                            }`}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Amount input */}
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-bw-600 text-sm">৳</span>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={p.amount}
                          min="0"
                          max={maxForRow}
                          step="0.01"
                          onChange={(e) =>
                            updatePaymentAmount(p.id, e.target.value)
                          }
                          className="h-8 text-sm px-2"
                        />
                        {/* Fill remaining shortcut */}
                        {remaining > 0 && (
                          <button
                            type="button"
                            onClick={() => fillRemaining(p.id)}
                            className="text-xs text-bw-500 hover:text-bw-800 whitespace-nowrap underline underline-offset-2"
                            title={`Fill ৳${maxForRow.toFixed(2)}`}
                          >
                            Fill
                          </button>
                        )}
                      </div>

                      {/* Remove row — keep at least 1 */}
                      {payments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePaymentRow(p.id)}
                          className="text-bw-400 hover:text-red-500 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Payment summary bar */}
              <div className="rounded-lg border border-bw-200 bg-white px-3 py-2 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-bw-600">Total payable:</span>
                  <span className="font-semibold">৳{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bw-600">Amount entered:</span>
                  <span
                    className={`font-semibold ${overPAID ? "text-red-600" : "text-green-700"}`}
                  >
                    ৳{totalPAID.toFixed(2)}
                  </span>
                </div>
                {paymentType === "PARTIAL" && remaining > 0 && (
                  <div className="flex justify-between border-t border-bw-100 pt-1">
                    <span className="text-bw-600">Remaining DUE:</span>
                    <span className="font-semibold text-amber-600">
                      ৳{remaining.toFixed(2)}
                    </span>
                  </div>
                )}
                {overPAID && (
                  <p className="text-red-500 text-xs">
                    ⚠ Amount exceeds total — please adjust.
                  </p>
                )}
                {paymentType === "PAID" &&
                  !overPAID &&
                  totalPAID > 0 &&
                  remaining === 0 && (
                    <p className="text-green-600 text-xs">✓ Fully PAID</p>
                  )}
              </div>

              {/* Multiple methods breakdown */}
              {payments.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {payments.map((p) =>
                    parseFloat(p.amount) > 0 ? (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${METHOD_COLORS[p.method]}`}
                      >
                        {p.method}: ৳{parseFloat(p.amount).toFixed(2)}
                      </span>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          )}

          {/* DUE indicator */}
          {paymentType === "DUE" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-700">Full amount DUE:</span>
                <span className="font-semibold text-red-700">
                  ৳{total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-red-500 mt-1">
                No payment will be recorded now.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 mt-3">
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
            disabled={
              loading ||
              cart.length === 0 ||
              (paymentType !== "DUE" && (overPAID || totalPAID === 0))
            }
          >
            {loading
              ? "Processing..."
              : paymentType === "DUE"
                ? "Confirm DUE"
                : `Pay ৳${totalPAID.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
