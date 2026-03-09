// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Package,
  Store,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuickStore } from "@/store/quickStore";
import { apiClient } from "@/hook/apiClient";
// types/dashboard.types.ts
export interface DashboardResponse {
  success: boolean;
  data: {
    summary: {
      totalStock: number;
      totalBranches: number;
      totalCustomers: number;
      totalStaff: number;
      totalSales: number;
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
    };
    monthlyRecap: Array<{
      month: string;
      orders: number;
      revenue: number;
      purchases: number;
      uniqueCustomers: number;
    }>;
    branchWiseStock: Array<{
      branchId: number;
      branchName: string;
      uniqueProducts: number;
      totalItems: number;
      stockValue: number;
    }>;
    lowStockProducts: Array<{
      variantId: number;
      productName: string;
      variantName: string;
      sku: string | null;
      quantity: number;
      sellingPrice: number;
      costPrice: number;
      potentialProfit: number;
    }>;
    latestOrders: Array<{
      id: number;
      invoiceNumber: string;
      date: string;
      partyName: string;
      amount: number;
      status: string;
      paidAmount: number;
      dueAmount: number;
      createdBy: string;
      branchName?: string;
    }>;
    recentlyAddedProducts: Array<{
      id: number;
      code: string;
      name: string;
      slug: string;
      sellingPrice: number;
      costPrice: number;
      createdBy: string;
      createdAt: string;
      image: string | null;
    }>;
  };
  meta: {
    branchFilter: string | number;
    timestamp: string;
  };
}

// Loading Skeleton Component
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 min-h-screen ">
    {/* Summary Cards Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 bg-bw-900 rounded-lg animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-bw-900 p-4 rounded-lg h-80 animate-pulse"></div>
      <div className="bg-bw-900 p-4 rounded-lg h-80 animate-pulse"></div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<
    DashboardResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeBranch, fetchBranches } = useQuickStore();
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch dashboard data
  const fetchDashboardData = async (branchId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient<DashboardResponse>(
        `${import.meta.env.VITE_SERVER}/dashboard/get-dashboard-data`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { branchid: branchId }, // Note: API expects 'branchid' not 'brachid'
        },
      );

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBranches();
  }, []);

  // Load data when active branch changes
  useEffect(() => {
    if (activeBranch) {
      fetchDashboardData(activeBranch.id);
    } else {
      fetchDashboardData(); // Fetch all branches data
    }
  }, [activeBranch]);

  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData(activeBranch?.id)}
            className="px-4 py-2 bg-[#f68826] text-white rounded-lg hover:bg-[#e07c1f] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    summary,
    monthlyRecap,
    branchWiseStock,
    lowStockProducts,
    latestOrders,
    recentlyAddedProducts,
  } = dashboardData;

  // Prepare data for charts
  const monthlyChartData = monthlyRecap.map((item) => ({
    month: item.month,
    revenue: item.revenue / 1000, // Convert to thousands for better display
    orders: item.orders,
    customers: item.uniqueCustomers,
  }));

  const branchStockChartData = branchWiseStock.map((item) => ({
    branch: item.branchName,
    stock: item.totalItems,
    value: item.stockValue,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen  text-gray-100">
      {/* SECTION 1: Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        <Card
          icon={<Package />}
          title="Total Stock"
          value={summary.totalStock.toLocaleString()}
        />
        <Card
          icon={<Store />}
          title="Branches"
          value={summary.totalBranches.toLocaleString()}
        />
        <Card
          icon={<Users />}
          title="Customers"
          value={summary.totalCustomers.toLocaleString()}
        />
        <Card
          icon={<Users />}
          title="Staff"
          value={summary.totalStaff.toLocaleString()}
        />
        <Card
          icon={<DollarSign />}
          title="Total Sales"
          value={summary.totalSales.toLocaleString()}
        />
      </div>

      {/* SECTION 2: Monthly Recap + Branch Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Recap Chart */}
        <div className="bg-bw-900 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Monthly Revenue Trend
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#f68826] rounded-full"></span>
                Revenue (K)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value: number) => [`${value}K`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f68826"
                strokeWidth={3}
                dot={{ fill: "#f68826", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Stock + Low Stock */}
        <div className="bg-bw-900 p-4 rounded-lg shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Branch-wise Stock Distribution
          </h3>

          {/* Branch Stock Bar Chart */}
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={branchStockChartData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="branch" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Items"]}
              />
              <Bar dataKey="stock" fill="#f68826" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Low Stock Products */}
          {lowStockProducts.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Low Stock Alert ({lowStockProducts.length} products)
              </h4>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-bw-900">
                    <tr>
                      <th className="px-2 py-1 text-left text-gray-400">
                        Product
                      </th>
                      <th className="px-2 py-1 text-left text-gray-400">SKU</th>
                      <th className="px-2 py-1 text-left text-gray-400">
                        Stock
                      </th>
                      <th className="px-2 py-1 text-left text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p) => (
                      <tr
                        key={p.variantId}
                        className="border-t border-gray-700"
                      >
                        <td className="px-2 py-2">
                          <div>
                            <div className="font-medium">{p.productName}</div>
                            {p.variantName !== "Default" && (
                              <div className="text-xs text-gray-500">
                                {p.variantName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-400">
                          {p.sku || "N/A"}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`font-bold ${
                              p.quantity <= 5
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              p.quantity <= 5
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {p.quantity <= 5 ? "Critical" : "Low"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialCard
          icon={<CreditCard />}
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          trend="+12.5%"
          trendUp={true}
        />
        <FinancialCard
          icon={<CreditCard />}
          title="Total Cost"
          value={formatCurrency(summary.totalCost)}
          trend="+5.2%"
          trendUp={false}
        />
        <FinancialCard
          icon={<TrendingUp />}
          title="Total Profit"
          value={formatCurrency(summary.totalProfit)}
          trend="+18.3%"
          trendUp={true}
        />
      </div>

      {/* SECTION 4: Latest Orders & Recently Added Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Orders */}
        <div className="bg-bw-900 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Latest Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-400">Invoice</th>
                  <th className="px-4 py-2 text-left text-gray-400">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-gray-400">Date</th>
                  <th className="px-4 py-2 text-right text-gray-400">Amount</th>
                  <th className="px-4 py-2 text-center text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {order.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">{order.partyName}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "PAID"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "PARTIAL"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="bg-bw-900 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Recently Added Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-400">Product</th>
                  <th className="px-4 py-2 text-left text-gray-400">Code</th>
                  <th className="px-4 py-2 text-right text-gray-400">Price</th>
                  <th className="px-4 py-2 text-left text-gray-400">
                    Added By
                  </th>
                  <th className="px-4 py-2 text-left text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentlyAddedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{product.code}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-4 py-3">{product.createdBy}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------- Card Components ----------------------
function Card({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="p-4 bg-bw-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#f68826]/20 rounded-lg">
          <div className="text-[#f68826]">{icon}</div>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">{title}</h3>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FinancialCard({
  icon,
  title,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="p-4 bg-bw-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-[#f68826]/20 rounded-lg">
          <div className="text-[#f68826]">{icon}</div>
        </div>
        <span
          className={`text-sm ${trendUp ? "text-green-400" : "text-red-400"}`}
        >
          {trend}
        </span>
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
