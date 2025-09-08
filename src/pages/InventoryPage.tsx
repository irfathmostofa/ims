"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  // Demo data for chart
  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 7000 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 8000 },
    { month: "Jul", sales: 7500 },
    { month: "Aug", sales: 8200 },
    { month: "Sep", sales: 6700 },
    // { month: "Oct", sales: 9100 },
    // { month: "Nov", sales: 9800 },
    // { month: "Dec", sales: 10200 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45</div>
            <p className="text-xs text-muted-foreground">+20% from last day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,230</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,542</div>
            <p className="text-xs text-muted-foreground">In stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4 w-[50%]">
        <TabsList className="flex space-x-2  rounded-md">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="BestSellingProducts"
            className="data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Best Selling Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesData}>
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#000" />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>#INV-1001</span>
                <span className="font-medium">$120</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>#INV-1002</span>
                <span className="font-medium">$250</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>#INV-1003</span>
                <span className="font-medium">$90</span>
              </div>
              <Button className="w-full mt-2">View All Orders</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Product A</span>
                <span className="text-red-500">5 left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product B</span>
                <span className="text-red-500">2 left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product C</span>
                <span className="text-red-500">8 left</span>
              </div>
              <Button className="w-full mt-2">Manage Inventory</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="BestSellingProducts">
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Product A</span>
                <span className="text-red-500">5 left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product B</span>
                <span className="text-red-500">2 left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product C</span>
                <span className="text-red-500">8 left</span>
              </div>
              <Button className="w-full mt-2">Manage Inventory</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
