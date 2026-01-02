"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReturnCart({
  cart,
  adjustQuantity,
  removeFromCart,
  totalRefund,
  handleConfirmReturn,
  handleClear,
  loading,
  selectedInvoice,
  invoiceDetails,
}: {
  cart: any[];
  adjustQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  totalRefund: number;
  handleConfirmReturn: () => void;
  handleClear: () => void;
  loading: boolean;
  selectedInvoice: any;
  invoiceDetails: any;
}) {
  const getMaxRefundAmount = () => {
    if (!invoiceDetails) return 0;
    // const totalAmount = parseFloat(invoiceDetails.total_amount) || 0;
    const paidAmount = parseFloat(invoiceDetails.paid_amount) || 0;
    const returnedAmount =
      parseFloat(invoiceDetails.total_returned_amount) || 0;

    // Maximum refund is the paid amount minus already returned amount
    return Math.max(0, paidAmount - returnedAmount);
  };

  const maxRefundAmount = getMaxRefundAmount();
  const canRefund = totalRefund <= maxRefundAmount;

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md flex flex-col border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 font-bold text-xl">Return Cart</h2>
        {selectedInvoice && (
          <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            Invoice: {selectedInvoice.code}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {cart.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <div className="mb-2">🛒</div>
            <p>No items in return cart</p>
            <p className="text-sm">
              Select products from the invoice to return
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product_variant_id}
              className=" p-3 bg-gray-50 rounded-lg border"
            >
              <p
                className="font-medium text-sm truncate max-w-[300px]"
                title={item.name}
              >
                {item.name}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-xs text-gray-600">
                    <div>Price: ৳{item.price.toFixed(2)}</div>
                    <div>Max: {item.maxQuantity} units</div>
                  </div>
                  <p className="text-sm text-red-600 font-medium">
                    Refund: ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded bg-white">
                    <button
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() =>
                        adjustQuantity(item.product_variant_id, -1)
                      }
                      disabled={item.quantity <= 1 || loading}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 min-w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => adjustQuantity(item.product_variant_id, 1)}
                      disabled={item.quantity >= item.maxQuantity || loading}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product_variant_id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 border-t pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Refund:</span>
            <span
              className={`text-xl font-bold ${
                canRefund ? "text-red-600" : "text-red-400"
              }`}
            >
              ৳{totalRefund.toFixed(2)}
            </span>
          </div>

          {invoiceDetails && (
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span className="font-medium">
                  ৳{parseFloat(invoiceDetails.paid_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Already Returned:</span>
                <span className="font-medium">
                  ৳
                  {parseFloat(
                    invoiceDetails.total_returned_amount || 0
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Maximum Refundable:</span>
                <span className="font-medium text-green-600">
                  ৳{maxRefundAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={loading || cart.length === 0}
            className="w-full"
          >
            Clear All
          </Button>
          <Button
            onClick={handleConfirmReturn}
            disabled={
              loading || cart.length === 0 || !selectedInvoice || !canRefund
            }
            className="w-full bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300"
          >
            {loading ? "Processing..." : "Confirm Return"}
          </Button>
        </div>
      </div>
    </div>
  );
}
