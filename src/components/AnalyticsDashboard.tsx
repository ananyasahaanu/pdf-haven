import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Package } from "lucide-react";
import { format, subDays, startOfDay, parseISO } from "date-fns";

interface Order {
  id: string;
  product_title: string;
  product_price: number;
  status: string;
  created_at: string;
  payment_method: string;
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

export function AnalyticsDashboard({ orders, pdfs }: { orders: Order[]; pdfs: Pdf[] }) {
  const approvedOrders = useMemo(() => orders.filter(o => o.status === "approved"), [orders]);
  const totalRevenue = useMemo(() => approvedOrders.reduce((s, o) => s + Number(o.product_price), 0), [approvedOrders]);

  // Revenue over last 30 days
  const revenueData = useMemo(() => {
    const days = 30;
    const data: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = approvedOrders.filter(o => format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr);
      data.push({
        date: format(day, "dd MMM"),
        revenue: dayOrders.reduce((s, o) => s + Number(o.product_price), 0),
        orders: dayOrders.length,
      });
    }
    return data;
  }, [approvedOrders]);

  // Popular products (top 8 by order count)
  const popularProducts = useMemo(() => {
    const counts: Record<string, { title: string; count: number; revenue: number }> = {};
    approvedOrders.forEach(o => {
      if (!counts[o.product_title]) counts[o.product_title] = { title: o.product_title, count: 0, revenue: 0 };
      counts[o.product_title].count++;
      counts[o.product_title].revenue += Number(o.product_price);
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [approvedOrders]);

  // Order status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name === "approved" ? "Approved" : name === "rejected" ? "Rejected" : "Pending", value }));
  }, [orders]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    pdfs.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [pdfs]);

  // Payment method split
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedOrders.forEach(o => {
      const method = o.payment_method === "bkash" ? "bKash" : "Nagad";
      counts[method] = (counts[method] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [approvedOrders]);

  // Weekly trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; revenue: number; orders: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = subDays(new Date(), i * 7 + 6);
      const weekEnd = subDays(new Date(), i * 7);
      const weekOrders = approvedOrders.filter(o => {
        const d = parseISO(o.created_at);
        return d >= startOfDay(weekStart) && d <= startOfDay(subDays(weekEnd, -1));
      });
      weeks.push({
        week: `W${8 - i}`,
        revenue: weekOrders.reduce((s, o) => s + Number(o.product_price), 0),
        orders: weekOrders.length,
      });
    }
    return weeks;
  }, [approvedOrders]);

  const avgOrderValue = approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  return (
    <div className="space-y-6">
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
          <h3 className="font-display text-lg font-semibold mb-1">Revenue (Last 30 Days)</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily revenue from approved orders</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `৳${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
                  formatter={(value: number) => [`৳${value}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
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
              <p className="text-sm text-muted-foreground text-center py-8">No order data yet.</p>
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

        {/* Weekly Trend */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Weekly Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue and orders per week</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (৳)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="hsl(280, 60%, 55%)" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold mb-1">Order Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution of all orders</p>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
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
                {paymentData.length > 0 && (
                  <>
                    <div className="border-t border-border my-4" />
                    <h4 className="font-display text-sm font-semibold mb-2">Payment Methods</h4>
                    {paymentData.map((pm, i) => (
                      <div key={pm.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[(i + 3) % CHART_COLORS.length] }} />
                        <span className="text-sm flex-1">{pm.name}</span>
                        <Badge variant="secondary" className="text-xs">{pm.value} orders</Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
