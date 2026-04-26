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
  Activity,
  CheckCircle2,
  XCircle,
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

// Enhanced Skeleton Component
const DashboardSkeleton = () => (
  <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-bw-900 rounded-xl animate-pulse backdrop-blur-sm"
        ></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-72 bg-bw-900 rounded-xl animate-pulse backdrop-blur-sm"
        ></div>
      ))}
    </div>
  </div>
);

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
  const paidOrders = latestOrders.filter((o) => o.status === "PAID").length;

  return (
    <div className="min-h-screen  p-2 lg:p-4 space-y-4">
      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        <KPICard
          icon={<Package className="h-5 w-5" />}
          title="Total Stock"
          value={summary.totalStock.toLocaleString()}
          change="+2.1%"
          trend="up"
        />
        <KPICard
          icon={<Store className="h-5 w-5" />}
          title="Branches"
          value={summary.totalBranches.toLocaleString()}
          change="Active"
          trend="neutral"
        />
        <KPICard
          icon={<Users className="h-5 w-5" />}
          title="Customers"
          value={summary.totalCustomers.toLocaleString()}
          change="+5.3%"
          trend="up"
        />
        <KPICard
          icon={<Activity className="h-5 w-5" />}
          title="Orders"
          value={ordersCount.toString()}
          change={`${paidOrders} Paid`}
          trend="neutral"
        />
        <KPICard
          icon={<DollarSign className="h-5 w-5" />}
          title="Total Sales"
          value={summary.totalSales.toLocaleString()}
          change="+8.2%"
          trend="up"
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

      {/* Additional Insights */}
    </div>
  );
}

// ==================== Components ====================

function KPICard({
  icon,
  title,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendIcon = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  const trendColor = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <div className="bg-bw-900 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-700 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4">
        {/* Left section with icon and title */}
        <div className="flex-1">
          <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-all duration-300 w-fit mb-3">
            <div className="text-orange-500">{icon}</div>
          </div>
          <p className="text-sm text-gray-400">{title}</p>
        </div>

        {/* Right section with value and change */}
        <div className="text-right">
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {value}
          </p>
          <div className="flex items-center justify-end gap-1">
            <span className={`text-xs font-medium ${trendColor[trend]}`}>
              {trendIcon[trend]}
            </span>
            <p className={`text-xs font-medium ${trendColor[trend]}`}>
              {change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialSummaryCard({
  title,
  value,
  change,
  icon,
  isDanger = false,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isDanger?: boolean;
}) {
  return (
    <div className="bg-bw-900 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-700 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-2 rounded-lg group-hover:opacity-80 transition-all duration-300 ${
            isDanger ? "bg-red-500/10" : "bg-orange-500/10"
          }`}
        >
          <div className={isDanger ? "text-red-500" : "text-orange-500"}>
            {icon}
          </div>
        </div>
        <span
          className={`text-xs font-medium ${isDanger ? "text-red-400" : "text-green-400"}`}
        >
          {change}
        </span>
      </div>
      <p className="text-xs lg:text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-lg lg:text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function OrderRow({
  order,
  formatCurrency,
  formatDate,
}: {
  order: any;
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
}) {
  const statusConfig = {
    PAID: { bg: "bg-green-500/10", text: "text-green-400", icon: CheckCircle2 },
    PARTIAL: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      icon: AlertCircle,
    },
    UNPAID: { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
  };
  const config =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.UNPAID;
  const IconComponent = config.icon;

  return (
    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">
            {order.invoiceNumber}
          </p>
          <p className="text-xs text-gray-400">{order.partyName}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.text}`}
        >
          <IconComponent className="h-3 w-3" />
          {order.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{formatDate(order.date)}</span>
        <span className="font-semibold text-white">
          {formatCurrency(order.amount)}
        </span>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  formatCurrency,
}: {
  product: any;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {product.name}
          </p>
          <p className="text-xs text-gray-400">SKU: {product.code}</p>
        </div>
        <span className="text-sm font-bold text-orange-400 whitespace-nowrap">
          {formatCurrency(product.sellingPrice)}
        </span>
      </div>
      <p className="text-xs text-gray-400">Added by {product.createdBy}</p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-bw-900 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
          {icon}
        </div>
        <p className="text-xs lg:text-sm text-gray-400">{label}</p>
      </div>
      <p className="text-xl lg:text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
