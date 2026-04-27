import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export function KPICard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
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
        </div>
      </div>
    </div>
  );
}

export function FinancialSummaryCard({
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

export function OrderRow({
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

export function ProductRow({
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

export function InsightCard({
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
