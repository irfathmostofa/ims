import { apiClient } from "@/hook/apiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface PartyInfo {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER";
  phone: string;
  email: string | null;
  address: string;
  credit_limit: number;
  loyalty_points: number;
  status: string;
  branch_name: string;
  created_at: string;
}

interface Payment {
  id: number;
  invoice_code: string;
  invoice_type: string;
  method: string;
  amount: number;
  payment_date: string;
  reference_no: string;
  created_by_name: string;
  created_at: string;
}

interface InvoiceItem {
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

interface Invoice {
  id: number;
  code: string;
  type: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  created_by_name: string;
  created_at: string;
  items: InvoiceItem[];
}

interface Summary {
  total_outstanding: number;
  total_sales: number;
  total_purchases: number;
  total_invoices: number;
  total_payments: number;
  credit_utilization: number;
}

interface PartyData {
  info: PartyInfo;
  payments: Payment[];
  invoices: Invoice[];
  summary: Summary;
  outstanding_invoices: any[];
}

export const PartyViewPage = () => {
  const { type, id } = useParams();
  const [partyData, setPartyData] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);

  const getPartyData = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/get-party-by-id`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { id: Number(id), type: type?.toUpperCase() },
        },
      );

      if (response.data) {
        setPartyData(response.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch party data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && type) {
      getPartyData();
    }
  }, [id, type]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "DUE":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Due
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Partial
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CUSTOMER":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Customer
          </Badge>
        );
      case "SUPPLIER":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Supplier
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Loading party data...</div>
      </div>
    );
  }

  if (!partyData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          Failed to load party data
        </div>
      </div>
    );
  }

  const { info, payments, invoices, summary } = partyData;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Info Card */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">{info.name}</CardTitle>
              <div className="flex gap-2">
                {getTypeBadge(info.type)}
                <Badge
                  className={
                    info.status === "A"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {info.status === "A" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <p className="text-gray-500">
              Code: {info.code} • {info.branch_name}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{info.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{info.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{info.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Credit Limit:</span>
                <span>{formatCurrency(info.credit_limit)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-gray-600 mt-1">{info.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Member since {formatDate(info.created_at)}</span>
              {info.loyalty_points > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Loyalty Points: {info.loyalty_points}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats Card */}
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(summary.total_sales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Purchases</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(summary.total_purchases)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Payments</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(summary.total_payments)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding Balance</span>
                <span
                  className={`font-bold ${summary.total_outstanding > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(summary.total_outstanding)}
                </span>
              </div>
              {info.credit_limit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Credit Utilization</span>
                  <span
                    className={`font-bold ${summary.credit_utilization > 80 ? "text-red-600" : summary.credit_utilization > 50 ? "text-yellow-600" : "text-green-600"}`}
                  >
                    {summary.credit_utilization}%
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Total Invoices</span>
                <span>{summary.total_invoices}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue={info.type === "SUPPLIER" ? "purchase" : "invoices"}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="w-4 h-4 mr-2" />
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="outstanding">
            <AlertCircle className="w-4 h-4 mr-2" />
            Outstanding ({partyData.outstanding_invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.code}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.paid_amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.due_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{invoice.items.length} items</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Received By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.invoice_code}
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.reference_no || "N/A"}</TableCell>
                      <TableCell>{payment.created_by_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Tab */}
        <TabsContent value="outstanding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {partyData.outstanding_invoices.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    No Outstanding Invoices
                  </h3>
                  <p className="text-gray-500 mt-2">All invoices are paid</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Due Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partyData.outstanding_invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.code}
                        </TableCell>
                        <TableCell>
                          {formatDate(invoice.invoice_date)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(invoice.total_amount)}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {formatCurrency(invoice.due_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.days_overdue > 30
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {invoice.days_overdue} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm">Receive Payment</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
