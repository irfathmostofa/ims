"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { convertNumberToWords } from "../utils/formatter";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type Company = {
  name?: string;
  address: string;
  phone: string;
  email: string;
};

type InvoiceModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  cart: CartItem[];
  total: number;
  user: Company;
  paymentMethod: string;
  paymentType: string;
  paidAmount: number;
  invoiceNumber: string;
  handleClear: () => void;
};

export default function InvoiceModal({
  isOpen,
  setIsOpen,
  customerName,
  customerPhone,
  customerAddress,
  cart,
  total,
  user,
  paymentMethod,
  paymentType,
  paidAmount,
  invoiceNumber,
  handleClear,
}: InvoiceModalProps) {
  const [invoiceDate, setInvoiceDate] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setInvoiceDate(
        now.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, [isOpen]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = 0;
  const discount = 0;
  const finalTotal = subtotal + tax - discount;
  const balanceDue = finalTotal - paidAmount;

  const getPaymentStatus = () => {
    if (paymentType === "paid" && paidAmount >= total) {
      return "PAID";
    } else if (paymentType === "partial" && paidAmount > 0) {
      return "PARTIAL";
    } else if (paymentType === "due") {
      return "DUE";
    }
    return "UNKNOWN";
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            /* Print Styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 20px;
              background: white;
              color: #000;
            }
            .invoice-container {
              max-width: 700px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mt-2 { margin-top: 8px; }
            .mt-3 { margin-top: 12px; }
            .pt-2 { padding-top: 8px; }
            .pt-3 { padding-top: 12px; }
            .pb-2 { padding-bottom: 8px; }
            .border-top { border-top: 1px dashed #000; }
            .border-bottom { border-bottom: 1px dashed #000; }
            .border-double { border-top: 3px double #000; }
            .flex { display: flex; }
            .flex-between { display: flex; justify-content: space-between; }
            .flex-between-center { display: flex; justify-content: space-between; align-items: center; }
            .gap-2 { gap: 8px; }
            .w-full { width: 100%; }
            
            /* Invoice Header */
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 4px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
            }
            
            /* Invoice Info Grid */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 16px;
              padding: 8px 0;
              border-bottom: 1px dashed #000;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              min-width: 70px;
            }
            
            /* Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            th, td {
              padding: 6px 4px;
              text-align: left;
            }
            th {
              font-weight: bold;
              border-bottom: 2px solid #000;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .item-row td {
              border-bottom: 1px dotted #ccc;
              padding: 5px 4px;
            }
            .item-row:last-child td {
              border-bottom: none;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            /* Totals Section */
            .totals {
              margin-top: 12px;
              padding-top: 12px;
              border-top: 2px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .grand-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 4px;
            }
            
            /* Footer */
            .footer {
              margin-top: 20px;
              padding-top: 12px;
              border-top: 1px dashed #000;
              text-align: center;
              font-size: 10px;
            }
            .footer-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              margin-bottom: 12px;
              text-align: center;
            }
            
            /* Amount in words */
            .amount-words {
              font-size: 10px;
              margin-top: 4px;
              border-top: 1px dotted #ccc;
              padding-top: 4px;
            }
            
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownload = () => {
    alert("PDF download functionality to be implemented");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900 text-white no-print">
          <DialogHeader className="p-0">
            <DialogTitle className="text-lg font-bold">Invoice</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => {
              handleClear();
              setIsOpen(false);
            }}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div
            ref={printRef}
            className="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <div className="text-2xl font-bold tracking-wider">
                {user.name || "INVENTORY SYS"}
              </div>
              <div className="text-sm">
                {user.address}
                <br />
                Phone: {user.phone} | Email: {user.email}
              </div>
              <div className="text-xl font-bold mt-2 tracking-widest">
                TAX INVOICE
              </div>
              <div className="text-sm font-bold mt-1">#{invoiceNumber}</div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm border-b border-dashed pb-3 mb-3">
              <div>
                <div>
                  <span className="font-bold">Date:</span> {invoiceDate}
                </div>
                <div>
                  <span className="font-bold">Customer:</span>{" "}
                  {customerName || "Walk-in Customer"}
                </div>
                <div>
                  <span className="font-bold">Phone:</span>{" "}
                  {customerPhone || "N/A"}
                </div>
              </div>
              <div>
                <div>
                  <span className="font-bold">Payment:</span>{" "}
                  {paymentMethod || "Cash"} ({getPaymentStatus()})
                </div>
                <div>
                  <span className="font-bold">Paid:</span> ৳{paidAmount}
                </div>
                {customerAddress && (
                  <div>
                    <span className="font-bold">Address:</span>{" "}
                    {customerAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item.id} className="item-row">
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">৳{item.price}</td>
                    <td className="text-right">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="total-row">
                  <span>Discount</span>
                  <span>-৳{discount}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="total-row">
                  <span>Tax</span>
                  <span>৳{tax}</span>
                </div>
              )}
              <div className="grand-total flex justify-between">
                <span>TOTAL</span>
                <span>৳{finalTotal}</span>
              </div>

              {paidAmount > 0 && (
                <>
                  <div className="total-row">
                    <span>Paid</span>
                    <span>৳{paidAmount}</span>
                  </div>
                  <div className="total-row font-bold">
                    <span>Balance Due</span>
                    <span>৳{balanceDue}</span>
                  </div>
                </>
              )}

              <div className="amount-words text-center">
                {convertNumberToWords(finalTotal)}
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <div className="footer-grid">
                <div>
                  <div className="font-bold text-xs">Customer Copy</div>
                  <div className="text-xs">Keep for records</div>
                </div>
                <div>
                  <div className="font-bold text-xs">Terms</div>
                  <div className="text-xs">Items not returnable</div>
                </div>
                <div>
                  <div className="font-bold text-xs">Signature</div>
                  <div className="border-t border-black pt-1 mt-1 text-xs">
                    Authorized
                  </div>
                </div>
              </div>
              <div className="text-xs mt-2">
                Thank you for your business!
                <br />
                {user.name || "InventorySys"} | {user.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="p-3 border-t bg-gray-50 no-print gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 text-white bg-gray-900 hover:bg-gray-800"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleClear();
              setIsOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
