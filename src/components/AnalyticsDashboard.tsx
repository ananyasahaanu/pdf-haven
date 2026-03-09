import { useMemo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Package, CalendarIcon, Download, FileText } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, parseISO, eachDayOfInterval, eachWeekOfInterval, isWithinInterval, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  product_title: string;
  product_price: number;
  status: string;
  created_at: string;
  payment_method: string;
  customer_name: string;
  customer_mobile: string;
  transaction_id: string;
}

interface Pdf {
  id: string;
  title: string;
  category: string;
  price: number;
  is_published: boolean;
  created_at: string;
}

const CHART_COLORS = [
  "hsl(245, 58%, 51%)",
  "hsl(280, 60%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(180, 60%, 45%)",
  "hsl(320, 60%, 50%)",
];

type PresetRange = "7d" | "30d" | "90d" | "all" | "custom";

function generateCSV(orders: Order[], pdfs: Pdf[], dateRange: { from: Date; to: Date }) {
  const rangeLabel = `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`;
  const approved = orders.filter(o => o.status === "approved");
  const totalRevenue = approved.reduce((s, o) => s + Number(o.product_price), 0);

  let csv = `PDFStore Analytics Report\n`;
  csv += `Period: ${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}\n\n`;

  // Summary
  csv += `SUMMARY\n`;
  csv += `Total Revenue,৳${totalRevenue.toFixed(0)}\n`;
  csv += `Total Orders,${orders.length}\n`;
  csv += `Approved Orders,${approved.length}\n`;
  csv += `Avg Order Value,৳${approved.length > 0 ? (totalRevenue / approved.length).toFixed(0) : 0}\n`;
  csv += `Total Products,${pdfs.length}\n\n`;

  // Orders detail
  csv += `ORDERS\n`;
  csv += `Date,Customer,Mobile,Product,Price,Payment Method,Transaction ID,Status\n`;
  orders.forEach(o => {
    csv += `${format(parseISO(o.created_at), "yyyy-MM-dd HH:mm")},${o.customer_name},${o.customer_mobile},"${o.product_title}",${o.product_price},${o.payment_method},${o.transaction_id},${o.status}\n`;
  });

  csv += `\nPRODUCT PERFORMANCE\n`;
  csv += `Product,Orders,Revenue\n`;
  const counts: Record<string, { title: string; count: number; revenue: number }> = {};
  approved.forEach(o => {
    if (!counts[o.product_title]) counts[o.product_title] = { title: o.product_title, count: 0, revenue: 0 };
    counts[o.product_title].count++;
    counts[o.product_title].revenue += Number(o.product_price);
  });
  Object.values(counts).sort((a, b) => b.count - a.count).forEach(p => {
    csv += `"${p.title}",${p.count},৳${p.revenue.toFixed(0)}\n`;
  });

  return { csv, filename: `analytics_${rangeLabel}.csv` };
}

export function AnalyticsDashboard({ orders, pdfs }: { orders: Order[]; pdfs: Pdf[] }) {
  const [preset, setPreset] = useState<PresetRange>("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const dateRange = useMemo(() => {
    const now = new Date();
    if (preset === "custom" && customFrom && customTo) {
      return { from: startOfDay(customFrom), to: endOfDay(customTo) };
    }
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    if (preset === "all") {
      const earliest = orders.length > 0 ? parseISO(orders[orders.length - 1].created_at) : subDays(now, 30);
      return { from: startOfDay(earliest), to: endOfDay(now) };
    }
    return { from: startOfDay(subDays(now, daysMap[preset] || 30)), to: endOfDay(now) };
  }, [preset, customFrom, customTo, orders]);

  const filteredOrders = useMemo(() =>
    orders.filter(o => {
      const d = parseISO(o.created_at);
      return isWithinInterval(d, { start: dateRange.from, end: dateRange.to });
    }),
  [orders, dateRange]);

  const approvedOrders = useMemo(() => filteredOrders.filter(o => o.status === "approved"), [filteredOrders]);
  const totalRevenue = useMemo(() => approvedOrders.reduce((s, o) => s + Number(o.product_price), 0), [approvedOrders]);

  // Revenue over selected range
  const revenueData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    // If range > 60 days, aggregate weekly
    if (days.length > 60) {
      const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to });
      return weeks.map((weekStart, i) => {
        const weekEnd = i < weeks.length - 1 ? weeks[i + 1] : dateRange.to;
        const weekOrders = approvedOrders.filter(o => {
          const d = parseISO(o.created_at);
          return d >= weekStart && d < weekEnd;
        });
        return {
          date: format(weekStart, "dd MMM"),
          revenue: weekOrders.reduce((s, o) => s + Number(o.product_price), 0),
          orders: weekOrders.length,
        };
      });
    }
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = approvedOrders.filter(o => format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr);
      return {
        date: format(day, "dd MMM"),
        revenue: dayOrders.reduce((s, o) => s + Number(o.product_price), 0),
        orders: dayOrders.length,
      };
    });
  }, [approvedOrders, dateRange]);

  const popularProducts = useMemo(() => {
    const counts: Record<string, { title: string; count: number; revenue: number }> = {};
    approvedOrders.forEach(o => {
      if (!counts[o.product_title]) counts[o.product_title] = { title: o.product_title, count: 0, revenue: 0 };
      counts[o.product_title].count++;
      counts[o.product_title].revenue += Number(o.product_price);
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [approvedOrders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name === "approved" ? "Approved" : name === "rejected" ? "Rejected" : "Pending", value }));
  }, [filteredOrders]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    pdfs.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [pdfs]);

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedOrders.forEach(o => {
      const method = o.payment_method === "bkash" ? "bKash" : "Nagad";
      counts[method] = (counts[method] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [approvedOrders]);

  const avgOrderValue = approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;
  const dayCount = differenceInDays(dateRange.to, dateRange.from) + 1;

  const handleExportCSV = useCallback(() => {
    const { csv, filename } = generateCSV(filteredOrders, pdfs, dateRange);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders, pdfs, dateRange]);

  const handleExportJSON = useCallback(() => {
    const approved = filteredOrders.filter(o => o.status === "approved");
    const report = {
      period: { from: format(dateRange.from, "yyyy-MM-dd"), to: format(dateRange.to, "yyyy-MM-dd") },
      summary: {
        totalRevenue,
        totalOrders: filteredOrders.length,
        approvedOrders: approved.length,
        avgOrderValue: avgOrderValue.toFixed(0),
        totalProducts: pdfs.length,
      },
      orders: filteredOrders.map(o => ({
        date: o.created_at,
        customer: o.customer_name,
        product: o.product_title,
        price: o.product_price,
        method: o.payment_method,
        txn: o.transaction_id,
        status: o.status,
      })),
      popularProducts,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders, pdfs, dateRange, totalRevenue, avgOrderValue, popularProducts]);

  const presetButtons: { label: string; value: PresetRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Filter & Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
          {presetButtons.map(b => (
            <Button
              key={b.value}
              size="sm"
              variant={preset === b.value ? "default" : "ghost"}
              className={cn("h-8 text-xs", preset === b.value && "gradient-bg text-primary-foreground border-0")}
              onClick={() => setPreset(b.value)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1", preset === "custom" && "border-primary")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {preset === "custom" && customFrom ? format(customFrom, "dd MMM") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customFrom}
                onSelect={(d) => { setCustomFrom(d); setPreset("custom"); }}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1", preset === "custom" && "border-primary")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {preset === "custom" && customTo ? format(customTo, "dd MMM") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customTo}
                onSelect={(d) => { setCustomTo(d); setPreset("custom"); }}
                disabled={(date) => date > new Date() || (customFrom ? date < customFrom : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileText className="mr-2 h-4 w-4" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing data from <strong>{format(dateRange.from, "dd MMM yyyy")}</strong> to <strong>{format(dateRange.to, "dd MMM yyyy")}</strong> ({dayCount} days) · {filteredOrders.length} orders in range
      </p>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <DollarSign className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">৳{totalRevenue.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <ShoppingBag className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{approvedOrders.length}</div>
              <div className="text-xs text-muted-foreground">Completed Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">৳{avgOrderValue.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Avg Order Value</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <Package className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{pdfs.length}</div>
              <div className="text-xs text-muted-foreground">Total Products</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Revenue ({dayCount > 60 ? "Weekly" : "Daily"})</h3>
          <p className="text-xs text-muted-foreground mb-4">Revenue from approved orders in selected period</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={Math.max(0, Math.floor(revenueData.length / 8) - 1)} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `৳${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
                  formatter={(value: number, name: string) => [name === "revenue" ? `৳${value}` : value, name === "revenue" ? "Revenue" : "Orders"]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="hsl(280, 60%, 55%)" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Products */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Popular Products</h3>
            <p className="text-xs text-muted-foreground mb-4">Top selling products by order count</p>
            {popularProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No order data in this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
                      formatter={(value: number, name: string) => [name === "count" ? `${value} orders` : `৳${value}`, name === "count" ? "Orders" : "Revenue"]}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Order Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution of orders in selected period</p>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders in this period.</p>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category & Payment */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Products by Category</h3>
            <p className="text-xs text-muted-foreground mb-4">Category distribution of uploaded PDFs</p>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No products yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm flex-1 truncate">{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">{cat.value}</Badge>
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(cat.value / Math.max(...categoryData.map(c => c.value))) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Payment Methods</h3>
            <p className="text-xs text-muted-foreground mb-4">Payment method distribution for approved orders</p>
            {paymentData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment data in this period.</p>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {paymentData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
