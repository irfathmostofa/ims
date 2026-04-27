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
  Activity,
  CheckCircle2,
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
import { DashboardSkeleton } from "@/components/Dashboard/DashboardSkeleton";
import {
  FinancialSummaryCard,
  InsightCard,
  KPICard,
  OrderRow,
  ProductRow,
} from "../../components/Dashboard/Cards";

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
      totalOnlineSales: number;
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

// Enhanced Skeleton Component

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<
    DashboardResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState("6m");

  const { activeBranch, fetchBranches } = useQuickStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchDashboardData = async (branchId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient<DashboardResponse>(
        `${import.meta.env.VITE_SERVER}/dashboard/get-dashboard-data`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { branchid: branchId },
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

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeBranch) {
      fetchDashboardData(activeBranch.id);
    } else {
      fetchDashboardData();
    }
  }, [activeBranch]);

  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchDashboardData(activeBranch?.id)}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
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

  const monthlyChartData = monthlyRecap.map((item) => ({
    month: item.month,
    revenue: Math.round(item.revenue / 1000),
    orders: item.orders,
    customers: item.uniqueCustomers,
  }));

  const branchStockChartData = branchWiseStock.map((item) => ({
    branch: item.branchName,
    stock: item.totalItems,
    value: item.stockValue,
  }));

  const profitMargin =
    summary.totalRevenue > 0
      ? Math.round((summary.totalProfit / summary.totalRevenue) * 100)
      : 0;
  const ordersCount = latestOrders.length;

  return (
    <div className="min-h-screen  p-2 lg:p-4 space-y-4">
      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        <KPICard
          icon={<Package className="h-5 w-5" />}
          title="Total Stock"
          value={summary.totalStock.toLocaleString()}
        />
        <KPICard
          icon={<Store className="h-5 w-5" />}
          title="Branches"
          value={summary.totalBranches.toLocaleString()}
        />
        <KPICard
          icon={<Users className="h-5 w-5" />}
          title="Customers"
          value={summary.totalCustomers.toLocaleString()}
        />
        <KPICard
          icon={<Activity className="h-5 w-5" />}
          title="Orders"
          value={summary.totalOnlineSales.toString()}
        />
        <KPICard
          icon={<DollarSign className="h-5 w-5" />}
          title="Total Sales"
          value={summary.totalSales.toLocaleString()}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue & Orders Chart */}
        <div className="lg:col-span-2 bg-bw-900 rounded-xl backdrop-blur-sm border border-slate-700/50 p-5 lg:p-6 hover:border-slate-700 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-white">
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Last 6 months performance
              </p>
            </div>
            <div className="flex gap-2">
              {["1m", "3m", "6m", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dateRange === range
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700/50 text-gray-400 hover:bg-slate-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyChartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "0.75rem",
                  color: "#fff",
                }}
                formatter={(value: number) => [`${value}K`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: "#f97316", r: 5 }}
                activeDot={{ r: 7 }}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Summary */}
        <div className="space-y-4">
          <FinancialSummaryCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            change="+12.5%"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <FinancialSummaryCard
            title="Total Cost"
            value={formatCurrency(summary.totalCost)}
            change="+5.2%"
            icon={<CreditCard className="h-5 w-5" />}
            isDanger
          />
          <FinancialSummaryCard
            title="Total Profit"
            value={formatCurrency(summary.totalProfit)}
            change={`${profitMargin}% margin`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          label="Avg Order Value"
          value={formatCurrency(
            summary.totalRevenue / Math.max(ordersCount, 1),
          )}
          icon={<DollarSign />}
        />
        <InsightCard
          label="Stock Value"
          value={formatCurrency(
            branchWiseStock.reduce((sum, b) => sum + b.stockValue, 0),
          )}
          icon={<Package />}
        />
        <InsightCard
          label="Conversion Rate"
          value={`${summary.totalCustomers > 0 ? Math.round((ordersCount / summary.totalCustomers) * 100) : 0}%`}
          icon={<TrendingUp />}
        />
        <InsightCard
          label="Pending Amount"
          value={formatCurrency(
            latestOrders.reduce((sum, o) => sum + o.dueAmount, 0),
          )}
          icon={<AlertCircle />}
        />
      </div>
      {/* Stock & Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Branch-wise Stock */}
        <div className="bg-bw-900 rounded-xl backdrop-blur-sm border border-slate-700/50 p-5 lg:p-6 hover:border-slate-700 transition-all duration-300">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-5">
            Branch Stock Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={branchStockChartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
              <XAxis
                dataKey="branch"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "0.75rem",
                  color: "#fff",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Items"]}
              />
              <Bar dataKey="stock" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-bw-900 rounded-xl backdrop-blur-sm border border-slate-700/50 p-5 lg:p-6 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg lg:text-xl font-bold text-white">
              Low Stock Alert
            </h3>
            <span className="inline-flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-full text-xs font-semibold text-red-400">
              <AlertCircle className="h-3 w-3" />
              {lowStockProducts.length} items
            </span>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3 max-h-70 overflow-y-auto custom-scrollbar">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.variantId}
                  className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {product.productName}
                      </p>
                      {product.variantName !== "Default" && (
                        <p className="text-xs text-gray-400 truncate">
                          {product.variantName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        product.quantity <= 5
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {product.quantity} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      SKU: {product.sku || "N/A"}
                    </span>
                    <span className="text-gray-500">
                      ${product.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 6 && (
                <p className="text-center text-sm text-gray-400 pt-2">
                  +{lowStockProducts.length - 6} more items
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-400">All products are well-stocked!</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Orders & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Orders */}
        <div className="bg-bw-900 rounded-xl backdrop-blur-sm border border-slate-700/50 p-5 lg:p-6 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg lg:text-xl font-bold text-white">
              Latest Orders
            </h3>
            <button className="text-sm text-orange-500 hover:text-orange-400 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-80 custom-scrollbar">
            {latestOrders.slice(0, 8).map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="bg-bw-900 rounded-xl backdrop-blur-sm border border-slate-700/50 p-5 lg:p-6 hover:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg lg:text-xl font-bold text-white">
              Recent Products
            </h3>
            <button className="text-sm text-orange-500 hover:text-orange-400 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-80 custom-scrollbar">
            {recentlyAddedProducts.slice(0, 8).map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
