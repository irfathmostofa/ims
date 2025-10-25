"use client";

import {
  Users,
  Package,
  Store,
  DollarSign,
  TrendingUp,
  CreditCard,
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

// Dummy Data
const products = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    stock: 15,
    price: 1200,
    branch: "A",
  },
  {
    id: 2,
    name: "Headphones",
    category: "Accessories",
    stock: 3,
    price: 150,
    branch: "B",
  },
  {
    id: 3,
    name: "Smartphone",
    category: "Electronics",
    stock: 30,
    price: 800,
    branch: "A",
  },
  {
    id: 4,
    name: "Mouse",
    category: "Accessories",
    stock: 5,
    price: 25,
    branch: "C",
  },
  {
    id: 5,
    name: "Keyboard",
    category: "Accessories",
    stock: 75,
    price: 45,
    branch: "B",
  },
];

const branches = ["A", "B", "C"];

const orders = [
  {
    id: 1,
    product: "Laptop",
    customer: "John Doe",
    total: 2400,
    date: "2025-09-01",
  },
  {
    id: 2,
    product: "Headphones",
    customer: "Jane Smith",
    total: 300,
    date: "2025-09-02",
  },
  {
    id: 3,
    product: "Mouse",
    customer: "Alice Brown",
    total: 75,
    date: "2025-09-03",
  },
  {
    id: 4,
    product: "Mouse",
    customer: "Alice Brown",
    total: 75,
    date: "2025-09-03",
  },
  {
    id: 5,
    product: "Mouse",
    customer: "Alice Brown",
    total: 75,
    date: "2025-09-03",
  },
];

// Monthly Recap Chart Data
const monthlyData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4000 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 7000 },
];

export default function DashboardPage() {
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalBranches = branches.length;
  const totalCustomers = 45;
  const totalStaff = 12;
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);

  const totalRevenue = totalSales;
  const totalCost = totalSales * 0.6;
  const totalProfit = totalRevenue - totalCost;
  const latestOrders = orders.slice(-5).reverse();
  const recentProducts = products.slice(-5).reverse();
  const branchStockData = branches.map((branch) => ({
    branch,
    stock: products
      .filter((p) => p.branch === branch)
      .reduce((acc, p) => acc + p.stock, 0),
  }));

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  return (
    <div className="p-6 space-y-6  min-h-screen text-gray-100">
      {/* SECTION 1: Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          icon={<Package />}
          title="Total Stock"
          value={totalStock}
          bg="bg-[#003333]"
        />
        <Card
          icon={<Store />}
          title="Branches"
          value={totalBranches}
          bg="bg-[#003333]"
        />
        <Card
          icon={<Users />}
          title="Customers"
          value={totalCustomers}
          bg="bg-[#003333]"
        />
        <Card
          icon={<Users />}
          title="Staff"
          value={totalStaff}
          bg="bg-[#003333]"
        />
        <Card
          icon={<DollarSign />}
          title="Total Sales"
          value={`$${totalSales}`}
          bg="bg-[#003333]"
        />
      </div>

      {/* SECTION 2: Monthly Recap + Branch Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Recap */}
        <div className="bg-[#003333] p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-[#fff]">
            Monthly Recap Report
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#fff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Stock + Low Stock */}
        <div className="bg-[#003333] p-4 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold text-[#fff]">
            Branch-wise Stock
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={branchStockData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="branch" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ backgroundColor: "#003333", color: "#fff" }}
              />
              <Bar dataKey="stock" fill="#fff" />
            </BarChart>
          </ResponsiveContainer>

          {/* Low Stock Products */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-red-400">
              Low Stock Products
            </h4>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-[#fff]">Product</th>
                  <th className="px-2 py-1 text-left text-[#fff]">Branch</th>
                  <th className="px-2 py-1 text-left text-[#fff]">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-t border-gray-700">
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.branch}</td>
                    <td className="px-2 py-1 text-red-400 font-bold">
                      {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Finance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card
          icon={<CreditCard />}
          title="Total Revenue"
          value={`$${totalRevenue}`}
          bg="bg-[#003333]"
        />
        <Card
          icon={<CreditCard />}
          title="Total Cost"
          value={`$${totalCost}`}
          bg="bg-[#003333]"
        />
        <Card
          icon={<TrendingUp />}
          title="Total Profit"
          value={`$${totalProfit}`}
          bg="bg-[#003333]"
        />
      </div>
      {/* SECTION 4: Latest Orders & Recently Added Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#003333] p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-[#FFF]">
            Latest Orders
          </h3>
          <CustomTable
            data={latestOrders}
            columns={["product", "customer", "total", "date"]}
            headerColor="#FFF"
          />
        </div>

        <div className="bg-[#003333] p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-[#FFF]">
            Recently Added Products
          </h3>
          <CustomTable
            data={recentProducts}
            columns={["name", "category", "stock", "price"]}
            headerColor="#FFF"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------- Card Component ----------------------
function Card({
  icon,
  title,
  value,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  bg: string;
}) {
  return (
    <div
      className={`p-4 flex items-center gap-4 rounded-lg text-gray-900 font-semibold ${bg}`}
    >
      <div className="p-2 bg-white/75 rounded-full">{icon}</div>
      <div className="text-amber-50">
        <h3 className="text-sm">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
function CustomTable({
  data,
  columns,
  headerColor,
}: {
  data: any[];
  columns: string[];
  headerColor: string;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              className={`px-4 py-2 text-left`}
              style={{ color: headerColor }}
            >
              {col.toUpperCase()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-t border-gray-700">
            {columns.map((col) => (
              <td key={col} className="px-4 py-2">
                {row[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
