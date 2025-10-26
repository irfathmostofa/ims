import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { printView } from "@/components/utils/print";

type RequisitionItem = {
  id: number;
  product_name: string;
  requested_qty: number;
  approved_qty?: number;
  remarks?: string;
};

type Requisition = {
  id: number;
  code: string;
  from_branch: string;
  to_branch: string;
  date: string;
  status: string;
  remarks?: string;
  items: RequisitionItem[];
};

export const RequisitionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dummyData: Requisition = {
      id: Number(id) || 1,
      code: "REQ-001",
      from_branch: "Dhaka Warehouse",
      to_branch: "Chittagong Branch",
      date: "2025-10-25",
      status: "Pending",
      remarks: "Urgent replenishment needed for sale season.",
      items: [
        {
          id: 1,
          product_name: "Product A",
          requested_qty: 50,
          approved_qty: undefined,
          remarks: "Top seller",
        },
        {
          id: 2,
          product_name: "Product B",
          requested_qty: 30,
          approved_qty: undefined,
        },
      ],
    };
    setRequisition(dummyData);
  }, [id]);

  const handleQtyChange = (itemId: number, value: string) => {
    if (!requisition) return;
    const num = Number(value);
    setRequisition({
      ...requisition,
      items: requisition.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              approved_qty:
                !isNaN(num) && num >= 0
                  ? Math.min(num, item.requested_qty)
                  : undefined,
            }
          : item
      ),
    });
  };

  const handleApprove = (approved: boolean) => {
    if (!requisition) return;
    setLoading(true);
    setTimeout(() => {
      setRequisition({
        ...requisition,
        status: approved ? "Approved" : "Rejected",
        items: requisition.items.map((item) => ({
          ...item,
          approved_qty: approved ? item.approved_qty ?? item.requested_qty : 0,
        })),
      });
      setLoading(false);
    }, 1000);
  };

  if (!requisition) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6 print:p-0 print:bg-white">
      {/* Breadcrumb and Action Bar */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-bw-900">
              Requisition Details —{" "}
              <span className="text-gray-500">{requisition.code}</span>
            </h1>
          </div>

          <div className="flex gap-2">
            {requisition.status === "Pending" && (
              <>
                <Button
                  onClick={() => handleApprove(true)}
                  className="btn-bw-primary"
                  disabled={loading}
                >
                  {loading ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  className="btn-bw-primary"
                  onClick={() => handleApprove(false)}
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Reject"}
                </Button>
              </>
            )}
            <Button
              className="btn-bw-primary"
              onClick={() => printView("printArea")}
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Section */}
      <section
        id="printArea"
        className="bg-white shadow-md rounded-md border print:shadow-none print:border-none print:rounded-none"
      >
        <div className="p-8 text-sm print:p-6">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold tracking-wide text-gray-800">
              Branch Requisition Form
            </h2>
            <p className="text-gray-500 text-sm">
              Document Code: {requisition.code}
            </p>
          </div>

          {/* Branch Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-gray-500">From Branch</p>
              <p className="font-semibold text-gray-800">
                {requisition.from_branch}
              </p>
            </div>
            <div>
              <p className="text-gray-500">To Branch</p>
              <p className="font-semibold text-gray-800">
                {requisition.to_branch}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold text-gray-800">{requisition.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`font-semibold px-3 py-1 rounded text-white ${
                  requisition.status === "Approved"
                    ? "bg-green-600"
                    : requisition.status === "Rejected"
                    ? "bg-red-600"
                    : "bg-yellow-500"
                }`}
              >
                {requisition.status}
              </span>
            </div>
            <div className="md:col-span-3">
              <p className="text-gray-500">Remarks</p>
              <p className="font-medium text-gray-800">
                {requisition.remarks || "—"}
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="border p-2">#</th>
                <th className="border p-2">Product Name</th>
                <th className="border p-2 text-center">Requested Qty</th>
                <th className="border p-2 text-center">Approved Qty</th>
                <th className="border p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requisition.items.map((item, index) => (
                <tr key={item.id} className="even:bg-gray-50">
                  <td className="border p-2 w-10 text-center">{index + 1}</td>
                  <td className="border p-2">{item.product_name}</td>
                  <td className="border p-2 text-center">
                    {item.requested_qty}
                  </td>
                  <td className="border p-2 text-center">
                    {requisition.status === "Pending" ? (
                      <input
                        type="number"
                        min={0}
                        max={item.requested_qty}
                        value={item.approved_qty ?? ""}
                        onChange={(e) =>
                          handleQtyChange(item.id, e.target.value)
                        }
                        className="w-20 border rounded px-2 py-1 text-center focus:ring focus:ring-blue-200 print:hidden"
                      />
                    ) : (
                      item.approved_qty ?? "—"
                    )}
                  </td>
                  <td className="border p-2">{item.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer for signature */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 text-center text-gray-700">
            <div>
              <div className="border-t border-gray-400 w-3/4 mx-auto mt-8"></div>
              <p className="text-sm mt-1">Requested By</p>
            </div>
            <div>
              <div className="border-t border-gray-400 w-3/4 mx-auto mt-8"></div>
              <p className="text-sm mt-1">Approved By</p>
            </div>
            <div className="hidden md:block">
              <div className="border-t border-gray-400 w-3/4 mx-auto mt-8"></div>
              <p className="text-sm mt-1">Received By</p>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            th, td {
              border-color: #999 !important;
            }
          }
        `}
      </style>
    </div>
  );
};
