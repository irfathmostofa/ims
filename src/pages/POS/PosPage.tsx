"use client";

import Cart, { type PaymentEntry, type PaymentType } from "@/components/POS/Cart";
import CustomerInfo from "@/components/POS/CustomerInfo";
import InvoiceModal from "@/components/POS/InvoiceModal";
import ProductList from "@/components/POS/ProductList";
import { apiClient } from "@/hook/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { toast } from "sonner";

// ProductCategory is no longer imported — categories are now inside ProductList

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Multi-payment state
  const [paymentType, setPaymentType] = useState<PaymentType>("PAID");
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { id: "1", method: "CASH", amount: "" },
  ]);

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);
  const { user } = useAuthStore();

  // ─── Cart operations ──────────────────────────────────────────────────────
  const addToCart = (product: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const adjustQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ─── Clear helpers ────────────────────────────────────────────────────────
  const handleClear = () => {
    if (cart.length > 0 && confirm("Are you sure you want to clear the cart?")) {
      clearNoConfirm();
    }
  };

  const clearNoConfirm = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerId(null);
    setSearch("");
    setCategory("All");
    setPaymentType("PAID");
    setPayments([{ id: Date.now().toString(), method: "CASH", amount: "" }]);
  };

  const cartClear = () => setCart([]);

  // ─── Create customer ──────────────────────────────────────────────────────
  const addCustomer = async (): Promise<number | null> => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return null;
    }
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/create-party`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            name: customerName.trim(),
            branch_id: user?.branch?.id,
            phone: customerPhone.trim(),
            address: customerAddress.trim(),
            type: "CUSTOMER",
          },
        },
      );
      toast.success(data.message || "Customer created successfully");
      return data.data?.id || null;
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Pay / create invoice ─────────────────────────────────────────────────
  const handlePay = async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    if (!user?.branch?.id) { toast.error("Branch information is missing"); return; }
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }

    const validPayments =
      paymentType === "DUE"
        ? [{ method: "CASH" as const, amount: 0, reference_no: null }]
        : payments
            .map((p) => ({
              method: p.method.toUpperCase() as "CASH" | "CARD" | "ONLINE",
              amount: parseFloat(p.amount) || 0,
              reference_no: null,
            }))
            .filter((p) => p.amount > 0);

    if (paymentType !== "DUE" && validPayments.length === 0) {
      toast.error("Please enter at least one payment amount");
      return;
    }

    const totalPAID = validPayments.reduce((s, p) => s + p.amount, 0);
    if (paymentType === "PAID" && totalPAID < total) {
      toast.error("PAID amount is less than total");
      return;
    }

    try {
      setLoading(true);

      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        const newId = await addCustomer();
        if (!newId) { setLoading(false); return; }
        finalCustomerId = newId;
      }

      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/create-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            branch_id: user?.branch?.id,
            party_id: finalCustomerId,
            type: "SALE" as const,
            invoice_date: new Date().toISOString().split("T")[0],
            items: cart.map((item) => ({
              product_variant_id: item.id,
              quantity: item.quantity,
              unit_price: item.price,
              discount: 0,
            })),
            payments: validPayments.map((p) => ({
              ...p,
              reference_no: finalCustomerId,
            })),
          },
        },
      );

      setInvoiceId(data.data?.code || data.data?.id || `INV-${Date.now()}`);
      toast.success(data.message || "Invoice created successfully");
      setInvoiceOpen(true);
      setUpdate(update + 1);
    } catch (err: any) {
      console.error("Invoice creation error:", err);
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  // ─── Invoice modal helpers ────────────────────────────────────────────────
  const totalPAIDForModal = payments.reduce(
    (s, p) => s + (parseFloat(p.amount) || 0),
    0,
  );
  const allMethodsLabel = payments
    .filter((p) => parseFloat(p.amount) > 0)
    .map((p) => p.method)
    .join(" + ");

  return (
    // Two columns: [product area] [cart]
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">

      {/* Left: Customer info + Product list (with categories baked in) */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <CustomerInfo
          customerId={customerId || 0}
          setCustomerId={setCustomerId}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerAddress={customerAddress}
          setCustomerAddress={setCustomerAddress}
        />
        <ProductList
          search={search}
          update={update}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          addToCart={addToCart}
        />
      </div>

      {/* Right: Cart — now wider since category column is gone */}
      <div className="w-full md:w-[26rem] shrink-0">
        <Cart
          loading={loading}
          cart={cart}
          setCart={setCart}
          adjustQuantity={adjustQuantity}
          removeFromCart={removeFromCart}
          total={total}
          handleClear={handleClear}
          clearAfterSave={clearNoConfirm}
          handlePay={handlePay}
          cartClear={cartClear}
          customerName={customerName}
          customerPhone={customerPhone}
          customerAddress={customerAddress}
          setCustomerName={setCustomerName}
          setCustomerPhone={setCustomerPhone}
          setCustomerAddress={setCustomerAddress}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          payments={payments}
          setPayments={setPayments}
        />
      </div>

      {/* Invoice modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        cart={cart}
        total={total}
        paymentMethod={allMethodsLabel || "CASH"}
        paymentType={paymentType}
        paidAmount={paymentType === "DUE" ? 0 : totalPAIDForModal}
        invoiceNumber={invoiceId}
        handleClear={clearNoConfirm}
      />
    </div>
  );
}