"use client";

import InvoiceProductList from "@/components/Return/InvoiceProductList";
import InvoiceSelector from "@/components/Return/InvoiceSelector";
import ReturnCart from "@/components/Return/ReturnCart";
import ReturnCustomerInfo from "@/components/Return/ReturnCustomerInfo";
import ReturnInvoiceModal from "@/components/Return/ReturnInvoiceModal";
import { apiClient } from "@/hook/apiClient";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReturnPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [returnCart, setReturnCart] = useState<any[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [searchParams, setSearchParams] = useState({
    page: "1",
    limit: "20",
    search: "",
    from_date: "",
    to_date: "",
    type: "SALE",
  });

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-All-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: searchParams,
        }
      );

      if (response.success) {
        setInvoices(response.data || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoice details when selected
  const fetchInvoiceDetails = async (invoiceId: number) => {
    try {
      setLoading(true);
      const invoiceResponse = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-invoices/${invoiceId}`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (invoiceResponse.success) {
        setInvoiceDetails(invoiceResponse.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch invoice details");
      setInvoiceDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchParams]);

  useEffect(() => {
    if (selectedInvoice?.id) {
      fetchInvoiceDetails(selectedInvoice.id);
      setReturnCart([]); // Clear cart when selecting new invoice
    } else {
      setInvoiceDetails(null);
    }
  }, [selectedInvoice]);

  const addToReturnCart = (product: any) => {
    setReturnCart((prev) => {
      const existing = prev.find(
        (item) => item.product_variant_id === product.product_variant_id
      );
      if (existing) {
        return prev.map((item) =>
          item.product_variant_id === product.product_variant_id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.available_for_return || product.quantity
                ),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.product_variant_id,
          product_variant_id: product.product_variant_id,
          name: `${product.product_name || ""} - ${
            product.variant_name || ""
          }`.trim(),
          price: parseFloat(product.unit_price),
          quantity: 1,
          maxQuantity:
            product.available_for_return || parseFloat(product.quantity),
          invoice_item_id: product.id,
        },
      ];
    });
  };

  const adjustQuantity = (id: number, delta: number) => {
    setReturnCart((prev) =>
      prev
        .map((item) => {
          if (item.product_variant_id === id) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: Math.min(newQuantity, item.maxQuantity),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setReturnCart((prev) =>
      prev.filter((item) => item.product_variant_id !== id)
    );
  };

  const totalRefund = returnCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirmReturn = async () => {
    if (!selectedInvoice) {
      toast.error("Please select an invoice first.");
      return;
    }
    if (returnCart.length === 0) {
      toast.error("No items selected for return.");
      return;
    }

    try {
      setLoading(true);
      const returnedItems = returnCart.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
      }));

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/create-return`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            invoice_id: selectedInvoice.id,
            returned_items: returnedItems,
            reason: "Customer return",
            refund_amount: totalRefund,
            refund_method: "cash",
          },
        }
      );

      if (response.success) {
        toast.success("Return processed successfully");
        setInvoiceOpen(true);
        handleClear();
        fetchInvoices(); // Refresh invoice list
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReturnCart([]);
    setSelectedInvoice(null);
    setInvoiceDetails(null);
  };

  const handleInvoiceSelect = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  const handleSearchChange = (params: any) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  };



  const handleDeselectInvoice = () => {
    handleClear();
  };

  return (
    <div className="w-full min-h-full bg-gray-50 ">
      {/* Header */}

      <div className="flex gap-2 max-w-full h-full">
        {!selectedInvoice ? (
          // Step 1: Invoice Selection View

          <div className="lg:col-span-2 w-full ">
            <div className="bg-white rounded-xl shadow-sm  ">
              <InvoiceSelector
                invoices={invoices}
                selectedInvoice={selectedInvoice}
                setSelectedInvoice={handleInvoiceSelect}
                loading={loading}
                onSearchChange={handleSearchChange}
                searchParams={searchParams}
              />
            </div>
          </div>
        ) : (
          // Step 2: Return Processing View
          <>
            {/* Left Column: Invoice Info */}
            <div className="lg:col-span-1 space-y-6 w-1/4">
              <div className="bg-white rounded-xl shadow-sm border p-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Selected Invoice
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectInvoice}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Select Another
                  </Button>
                </div>
                <ReturnCustomerInfo
                  customer={invoiceDetails}
                  invoice={selectedInvoice}
                />
              </div>
            </div>

            {/* Middle Column: Products */}
            <div className="lg:col-span-1 w-1/2">
              <div className="bg-white rounded-xl shadow-sm border h-full p-2">
                <InvoiceProductList
                  products={invoiceDetails?.items || []}
                  addToReturnCart={addToReturnCart}
                  returnCart={returnCart}
                  loading={loading}
                />
              </div>
            </div>

            {/* Right Column: Return Cart */}
            <div className="lg:col-span-1 w-1/4">
              <div className="bg-white rounded-xl shadow-sm  h-full ">
                <ReturnCart
                  cart={returnCart}
                  adjustQuantity={adjustQuantity}
                  removeFromCart={removeFromCart}
                  totalRefund={totalRefund}
                  handleConfirmReturn={handleConfirmReturn}
                  handleClear={handleClear}
                  loading={loading}
                  selectedInvoice={selectedInvoice}
                  invoiceDetails={invoiceDetails}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Return Invoice Modal */}
      <ReturnInvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        invoice={selectedInvoice}
        invoiceDetails={invoiceDetails}
        cart={returnCart}
        totalRefund={totalRefund}
        handleClear={handleClear}
      />
    </div>
  );
}
